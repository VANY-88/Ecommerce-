using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;
using WebShop.Api.Common;
using WebShop.Api.Data;
using WebShop.Api.DTOs.Payments;
using WebShop.Api.Models.Entities;
using WebShop.Api.Payments;
using WebShop.Api.Payments.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

// Owns every payment state transition. All writes are conditional UPDATEs, so concurrent
// callbacks (return URL + IPN), double clicks and retries can't apply a result twice.
public class PaymentService : IPaymentService
{
    private const string AlreadyPaidCode = "ALREADY_PAID";
    private const string InProgressCode = "PAYMENT_IN_PROGRESS";
    private const string ConfirmAbandonCode = "CONFIRM_ABANDON";

    // Gateway limits, in VND.
    private static readonly Dictionary<string, (long Min, long Max)> AmountLimits = new()
    {
        [PaymentMethods.VnPay] = (5_000, 999_999_999),
        [PaymentMethods.Momo] = (1_000, 50_000_000),
    };

    private enum ReconcileOutcome { Paid, NotPaid, Unknown }

    private readonly ApplicationDbContext _db;
    private readonly IVnPayService _vnPayService;
    private readonly IMomoService _momoService;
    private readonly PaymentOptions _options;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        ApplicationDbContext db,
        IVnPayService vnPayService,
        IMomoService momoService,
        IOptions<PaymentOptions> options,
        ILogger<PaymentService> logger)
    {
        _db = db;
        _vnPayService = vnPayService;
        _momoService = momoService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<CreatePaymentResponseDto> CreateOrReuseAttemptAsync(int orderId, string method, string clientIp, bool confirmAbandon)
    {
        var order = await LoadOrderAsync(orderId);

        if (order.PaymentStatus == PaymentStatuses.Paid)
        {
            throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
        }
        if (order.PaymentMethod != method)
        {
            throw ApiException.BadRequest($"This order is set to pay with {order.PaymentMethod}. Change the payment method first.");
        }
        if (order.PaymentStatus is not (PaymentStatuses.Pending or PaymentStatuses.Failed))
        {
            throw ApiException.BadRequest($"This order is not awaiting a {method} payment.");
        }

        var open = await GetOpenAttemptAsync(order.Id);
        if (open != null)
        {
            // Paying again with the same method hands back the open URL until it expires:
            // same TxnRef, so the gateway can only take the money once.
            var reusable = open.Method == method && open.PaymentUrl != null && DateTime.UtcNow < open.ExpiresAt;
            if (reusable && AgeSeconds(open) < _options.ReuseWithoutQuerySeconds)
            {
                return new CreatePaymentResponseDto { PaymentUrl = open.PaymentUrl! };
            }

            var outcome = await ReconcileAsync(open, clientIp, force: true);
            if (outcome == ReconcileOutcome.Paid)
            {
                throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
            }
            if (outcome == ReconcileOutcome.Unknown)
            {
                if (reusable)
                {
                    return new CreatePaymentResponseDto { PaymentUrl = open.PaymentUrl! };
                }
                await AbandonIfExpiredAsync(open, confirmAbandon);
            }
        }

        var amountVnd = (long)Math.Round(order.Price * _options.VndPerUnit, MidpointRounding.AwayFromZero);
        var (min, max) = AmountLimits[method];
        if (amountVnd < min || amountVnd > max)
        {
            throw ApiException.BadRequest(
                $"{method} only accepts payments between {min:N0} and {max:N0} VND (this order is {amountVnd:N0} VND).");
        }

        var txnRef = NewTxnRef(order.Id);
        var request = new GatewayPaymentRequest(txnRef, amountVnd, $"Thanh toan don hang {order.Id}", clientIp,
            _options.AttemptLifetimeMinutes);
        var createdAt = DateTime.UtcNow;
        var url = method == PaymentMethods.VnPay
            ? _vnPayService.CreatePaymentUrl(request)
            : await _momoService.CreatePaymentUrlAsync(request);

        var attempt = new PaymentAttempt
        {
            OrderId = order.Id,
            Method = method,
            TxnRef = txnRef,
            AmountVnd = amountVnd,
            GatewayCreateDate = url.CreateDate,
            PaymentUrl = url.PaymentUrl,
            Status = AttemptStatuses.Pending,
            CreatedAt = createdAt,
            ExpiresAt = createdAt.AddMinutes(_options.AttemptLifetimeMinutes),
        };

        try
        {
            await using var tx = await _db.Database.BeginTransactionAsync();
            _db.PaymentAttempts.Add(attempt);
            await _db.SaveChangesAsync();

            var updated = await _db.Orders
                .Where(o => o.Id == order.Id && o.PaymentMethod == method &&
                            (o.PaymentStatus == PaymentStatuses.Pending || o.PaymentStatus == PaymentStatuses.Failed))
                .ExecuteUpdateAsync(s => s
                    .SetProperty(o => o.PaymentStatus, PaymentStatuses.Pending)
                    .SetProperty(o => o.CurrentAttemptId, attempt.Id));
            if (updated == 0)
            {
                // Paid or switched method between our checks and now.
                await tx.RollbackAsync();
                var current = await LoadOrderAsync(orderId);
                if (current.PaymentStatus == PaymentStatuses.Paid)
                {
                    throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
                }
                throw ApiException.Conflict(InProgressCode, "The order changed while starting the payment. Please reload and try again.");
            }

            await tx.CommitAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // Another tab/click opened an attempt at the same moment: hand back that one.
            _db.ChangeTracker.Clear();
            var winner = await GetOpenAttemptAsync(order.Id);
            if (winner?.PaymentUrl != null && winner.Method == method)
            {
                return new CreatePaymentResponseDto { PaymentUrl = winner.PaymentUrl };
            }
            throw ApiException.Conflict(InProgressCode, "Another payment for this order was just started.",
                winner == null ? null : SecondsUntilSwitchAllowed(winner));
        }

        return new CreatePaymentResponseDto { PaymentUrl = url.PaymentUrl };
    }

    public async Task<ApplyResult> ApplyResultAsync(GatewayResult result)
    {
        var attempt = await _db.PaymentAttempts.AsNoTracking().FirstOrDefaultAsync(a => a.TxnRef == result.TxnRef);
        if (attempt == null)
        {
            _logger.LogWarning("Payment result for unknown TxnRef {TxnRef}", result.TxnRef);
            return new ApplyResult(ApplyResultStatus.NotFound, null);
        }

        var now = DateTime.UtcNow;
        switch (result.Outcome)
        {
            case GatewayOutcome.Paid:
                return await ApplyPaidAsync(attempt, result, now);

            case GatewayOutcome.Failed:
            case GatewayOutcome.NotFound:
                if (result.Outcome == GatewayOutcome.Failed && result.AmountVnd != 0 && result.AmountVnd != attempt.AmountVnd)
                {
                    return new ApplyResult(ApplyResultStatus.AmountMismatch, attempt.OrderId);
                }
                return await ApplyFailedAsync(attempt, result.ResponseCode ?? result.Outcome.ToString(), now);

            default:
                return new ApplyResult(ApplyResultStatus.Ignored, attempt.OrderId);
        }
    }

    public async Task<PaymentStatusDto> GetPaymentStatusAsync(int orderId, string clientIp)
    {
        var order = await LoadOrderAsync(orderId);
        var open = await GetOpenAttemptAsync(order.Id);

        if (open != null && await ReconcileAsync(open, clientIp, force: false) != ReconcileOutcome.Unknown)
        {
            order = await LoadOrderAsync(orderId);
            open = null;
        }

        var awaitingPayment = order.PaymentStatus is PaymentStatuses.Pending or PaymentStatuses.Failed;
        var switchAfter = open == null ? 0 : SecondsUntilSwitchAllowed(open);

        return new PaymentStatusDto
        {
            OrderId = order.Id,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            CanRetry = awaitingPayment,
            ActiveAttemptMethod = awaitingPayment ? open?.Method : null,
            ContinueAllowed = awaitingPayment && open != null && DateTime.UtcNow < open.ExpiresAt,
            SwitchAfterSeconds = awaitingPayment ? switchAfter : 0,
            WarnPossiblyPaid = awaitingPayment && open != null && switchAfter == 0,
        };
    }

    public async Task ChangePaymentMethodAsync(int orderId, string newMethod, string clientIp, bool confirmAbandon)
    {
        if (!PaymentMethods.All.Contains(newMethod))
        {
            throw ApiException.BadRequest("Invalid payment method.");
        }

        var order = await LoadOrderAsync(orderId);
        if (order.PaymentStatus == PaymentStatuses.Paid)
        {
            throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
        }
        if (order.PaymentMethod == PaymentMethods.Cod)
        {
            // COD orders go straight to fulfilment; switching them to prepaid is not supported.
            throw ApiException.BadRequest("Cash-on-delivery orders can't change payment method.");
        }
        if (order.PaymentMethod == newMethod)
        {
            return;
        }

        var open = await GetOpenAttemptAsync(order.Id);
        if (open != null)
        {
            var outcome = await ReconcileAsync(open, clientIp, force: true);
            if (outcome == ReconcileOutcome.Paid)
            {
                throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
            }
            if (outcome == ReconcileOutcome.Unknown)
            {
                await AbandonIfExpiredAsync(open, confirmAbandon);
            }
        }

        var toCod = newMethod == PaymentMethods.Cod;
        var expectedAttemptId = order.CurrentAttemptId;
        // Compare-and-swap on CurrentAttemptId too: if another tab opened an attempt since
        // we read the order, this matches nothing instead of orphaning that live attempt.
        var updated = await _db.Orders
            .Where(o => o.Id == order.Id && o.PaymentMethod == order.PaymentMethod &&
                        o.CurrentAttemptId == expectedAttemptId &&
                        (o.PaymentStatus == PaymentStatuses.Pending || o.PaymentStatus == PaymentStatuses.Failed))
            .ExecuteUpdateAsync(s => s
                .SetProperty(o => o.PaymentMethod, newMethod)
                .SetProperty(o => o.PaymentStatus, toCod ? PaymentStatuses.NotApplicable : PaymentStatuses.Pending)
                .SetProperty(o => o.Status, toCod ? OrderStatuses.Shipped : OrderStatuses.PendingPayment)
                .SetProperty(o => o.CurrentAttemptId, (int?)null));

        if (updated == 0)
        {
            var current = await LoadOrderAsync(orderId);
            if (current.PaymentStatus == PaymentStatuses.Paid)
            {
                throw ApiException.Conflict(AlreadyPaidCode, "This order has already been paid.");
            }
            throw ApiException.Conflict(InProgressCode, "The order changed in the meantime. Please reload and try again.");
        }
    }

    // Called when the gateway couldn't tell us an open attempt's outcome. While its URL can
    // still be paid (plus a grace period for a bank step started just before expiry), a
    // different attempt must not be opened — throws PAYMENT_IN_PROGRESS. After that the
    // attempt is closed so the user can move on, but only once they have confirmed they
    // understand it might have been paid (CONFIRM_ABANDON otherwise, before anything is
    // created). A late success is still recorded, or flagged for refund.
    private async Task AbandonIfExpiredAsync(PaymentAttempt open, bool confirmAbandon)
    {
        var wait = SecondsUntilSwitchAllowed(open);
        if (wait > 0)
        {
            var message = DateTime.UtcNow < open.ExpiresAt
                ? $"Your {open.Method} payment is still open. Continue with {open.Method}, or wait before choosing another method."
                : $"Your {open.Method} payment is still being confirmed. Please wait before paying again.";
            throw ApiException.Conflict(InProgressCode, message, wait);
        }
        if (!confirmAbandon)
        {
            throw ApiException.Conflict(ConfirmAbandonCode,
                $"We couldn't confirm whether your previous {open.Method} payment went through. If you already paid, don't pay again — check your orders instead.");
        }

        await ApplyFailedAsync(open, "ABANDONED", DateTime.UtcNow);
        _logger.LogWarning("Abandoned unconfirmed payment attempt {TxnRef} for order {OrderId}", open.TxnRef, open.OrderId);
    }

    // `force` skips the per-attempt throttle: used for user actions (retry / switch) that
    // must decide on a fresh gateway answer, not for status polling.
    private async Task<ReconcileOutcome> ReconcileAsync(PaymentAttempt attempt, string clientIp, bool force)
    {
        var now = DateTime.UtcNow;
        var throttleFrom = now.AddSeconds(-_options.QueryThrottleSeconds);

        // Claim the query slot atomically so parallel polls don't all hit the gateway.
        var claimed = await _db.PaymentAttempts
            .Where(a => a.Id == attempt.Id && a.Status == AttemptStatuses.Pending &&
                        (force || a.LastQueriedAt == null || a.LastQueriedAt < throttleFrom))
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.LastQueriedAt, now));

        if (claimed == 0)
        {
            return await OutcomeFromStoredStatusAsync(attempt.Id);
        }

        var result = attempt.Method == PaymentMethods.VnPay
            ? await _vnPayService.QueryAsync(attempt.TxnRef, attempt.GatewayCreateDate, clientIp)
            : await _momoService.QueryAsync(attempt.TxnRef);

        switch (result.Outcome)
        {
            case GatewayOutcome.Paid:
                await ApplyResultAsync(result);
                return await OutcomeFromStoredStatusAsync(attempt.Id);

            case GatewayOutcome.NotFound when now < attempt.ExpiresAt:
                // VNPay only knows a transaction once the customer has opened the URL, and
                // that can still happen until the URL expires. After that, not found = unpaid.
                return ReconcileOutcome.Unknown;

            case GatewayOutcome.Failed:
            case GatewayOutcome.NotFound:
                await ApplyResultAsync(result);
                // A concurrent success callback may have beaten the failure.
                return await OutcomeFromStoredStatusAsync(attempt.Id);

            default:
                return ReconcileOutcome.Unknown;
        }
    }

    private async Task<ReconcileOutcome> OutcomeFromStoredStatusAsync(int attemptId)
    {
        var status = await _db.PaymentAttempts.AsNoTracking()
            .Where(a => a.Id == attemptId).Select(a => a.Status).FirstAsync();
        return status switch
        {
            AttemptStatuses.Pending => ReconcileOutcome.Unknown,
            AttemptStatuses.Succeeded => ReconcileOutcome.Paid,
            // Failed, or RefundRequired (paid twice / wrong amount): either way this attempt
            // is closed and whether the order is paid is decided by the order itself.
            _ => ReconcileOutcome.NotPaid,
        };
    }

    private DateTime SwitchAllowedAt(PaymentAttempt attempt) =>
        attempt.ExpiresAt.AddSeconds(_options.ExpiryGraceSeconds);

    private int SecondsUntilSwitchAllowed(PaymentAttempt attempt) =>
        (int)Math.Ceiling(Math.Max(0, (SwitchAllowedAt(attempt) - DateTime.UtcNow).TotalSeconds));

    private async Task<ApplyResult> ApplyPaidAsync(PaymentAttempt attempt, GatewayResult result, DateTime now)
    {
        if (result.AmountVnd != attempt.AmountVnd)
        {
            // Money moved, but not the amount we asked for: never mark the order paid.
            _logger.LogError("Amount mismatch for {TxnRef}: expected {Expected} VND, gateway reported {Actual} VND",
                attempt.TxnRef, attempt.AmountVnd, result.AmountVnd);
            await _db.PaymentAttempts
                .Where(a => a.Id == attempt.Id && a.Status != AttemptStatuses.Succeeded && a.Status != AttemptStatuses.RefundRequired)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(a => a.Status, AttemptStatuses.RefundRequired)
                    .SetProperty(a => a.ResponseCode, "AMOUNT_MISMATCH")
                    .SetProperty(a => a.GatewayTransactionId, result.TransactionId)
                    .SetProperty(a => a.CompletedAt, now));
            return new ApplyResult(ApplyResultStatus.AmountMismatch, attempt.OrderId);
        }

        await using var tx = await _db.Database.BeginTransactionAsync();

        // Success wins over an earlier Failed/abandoned mark for the same attempt.
        var attemptUpdated = await _db.PaymentAttempts
            .Where(a => a.Id == attempt.Id && a.Status != AttemptStatuses.Succeeded && a.Status != AttemptStatuses.RefundRequired)
            .ExecuteUpdateAsync(s => s
                .SetProperty(a => a.Status, AttemptStatuses.Succeeded)
                .SetProperty(a => a.ResponseCode, result.ResponseCode)
                .SetProperty(a => a.GatewayTransactionId, result.TransactionId)
                .SetProperty(a => a.CompletedAt, now));
        if (attemptUpdated == 0)
        {
            await tx.RollbackAsync();
            return new ApplyResult(ApplyResultStatus.AlreadyFinal, attempt.OrderId);
        }

        var orderUpdated = await _db.Orders
            .Where(o => o.Id == attempt.OrderId && o.PaymentStatus != PaymentStatuses.Paid)
            .ExecuteUpdateAsync(s => s
                .SetProperty(o => o.PaymentStatus, PaymentStatuses.Paid)
                .SetProperty(o => o.Status, OrderStatuses.Shipped)
                // The money arrived through this gateway, even if the user switched method since.
                .SetProperty(o => o.PaymentMethod, attempt.Method)
                .SetProperty(o => o.GatewayTransactionId, result.TransactionId)
                .SetProperty(o => o.CurrentAttemptId, attempt.Id)
                .SetProperty(o => o.PaidAt, now));

        if (orderUpdated == 0)
        {
            // Already paid through another attempt: this is a genuine double payment.
            await _db.PaymentAttempts
                .Where(a => a.Id == attempt.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.Status, AttemptStatuses.RefundRequired));
            _logger.LogWarning("Double payment on order {OrderId}: attempt {TxnRef} ({Amount} VND, txn {TransactionId}) needs a refund",
                attempt.OrderId, attempt.TxnRef, attempt.AmountVnd, result.TransactionId);
        }

        await tx.CommitAsync();
        return new ApplyResult(ApplyResultStatus.Applied, attempt.OrderId);
    }

    private async Task<ApplyResult> ApplyFailedAsync(PaymentAttempt attempt, string responseCode, DateTime now)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var attemptUpdated = await _db.PaymentAttempts
            .Where(a => a.Id == attempt.Id && a.Status == AttemptStatuses.Pending)
            .ExecuteUpdateAsync(s => s
                .SetProperty(a => a.Status, AttemptStatuses.Failed)
                .SetProperty(a => a.ResponseCode, responseCode)
                .SetProperty(a => a.CompletedAt, now));
        if (attemptUpdated == 0)
        {
            await tx.RollbackAsync();
            return new ApplyResult(ApplyResultStatus.AlreadyFinal, attempt.OrderId);
        }

        // Only the current attempt may fail the order; a stale attempt's failure must not
        // override a newer attempt (or a paid order).
        await _db.Orders
            .Where(o => o.Id == attempt.OrderId && o.CurrentAttemptId == attempt.Id && o.PaymentStatus == PaymentStatuses.Pending)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.PaymentStatus, PaymentStatuses.Failed));

        await tx.CommitAsync();
        return new ApplyResult(ApplyResultStatus.Applied, attempt.OrderId);
    }

    private async Task<Order> LoadOrderAsync(int orderId) =>
        await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == orderId)
        ?? throw ApiException.NotFound("Order not found!");

    private Task<PaymentAttempt?> GetOpenAttemptAsync(int orderId) =>
        _db.PaymentAttempts.AsNoTracking()
            .FirstOrDefaultAsync(a => a.OrderId == orderId && a.Status == AttemptStatuses.Pending);

    private static int AgeSeconds(PaymentAttempt attempt) =>
        (int)Math.Max(0, (DateTime.UtcNow - attempt.CreatedAt).TotalSeconds);

    // Alphanumeric only (valid for both VNPay and Momo) and random, so refs never repeat
    // across databases sharing the same sandbox merchant code.
    private static string NewTxnRef(int orderId) =>
        $"{orderId}T{RandomNumberGenerator.GetString("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10)}";

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
