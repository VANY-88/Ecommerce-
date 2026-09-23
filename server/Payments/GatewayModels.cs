namespace WebShop.Api.Payments;

public enum GatewayOutcome
{
    Paid,
    Failed,
    // Not final yet (user still on the gateway, bank processing) — leave state unchanged.
    Processing,
    // The gateway has no record of the transaction.
    NotFound,
    // Couldn't get an answer (network error, bad response signature, unsupported).
    Unknown,
}

public record GatewayResult(
    string TxnRef,
    GatewayOutcome Outcome,
    long AmountVnd,
    string? TransactionId,
    string? ResponseCode);

public record GatewayPaymentRequest(string TxnRef, long AmountVnd, string OrderInfo, string ClientIp, int LifetimeMinutes);

public record GatewayPaymentUrl(string PaymentUrl, string CreateDate);

internal static class GatewayTime
{
    // Both gateways expect Vietnam local time (GMT+7) regardless of server timezone.
    public static DateTime VietnamNow() => DateTime.UtcNow.AddHours(7);

    public static string Format(DateTime vietnamTime) => vietnamTime.ToString("yyyyMMddHHmmss");
}
