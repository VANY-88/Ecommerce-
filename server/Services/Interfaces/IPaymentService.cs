using WebShop.Api.DTOs.Payments;
using WebShop.Api.Payments;

namespace WebShop.Api.Services.Interfaces;

public enum ApplyResultStatus
{
    Applied,
    // The attempt was already finalized by an earlier callback.
    AlreadyFinal,
    // A non-final gateway state; nothing changed.
    Ignored,
    NotFound,
    AmountMismatch,
}

public record ApplyResult(ApplyResultStatus Status, int? OrderId);

public interface IPaymentService
{
    Task<CreatePaymentResponseDto> CreateOrReuseAttemptAsync(int orderId, string method, string clientIp, bool confirmAbandon);

    // Idempotent: safe to call for the same gateway result any number of times
    // (return URL + IPN + gateway retries).
    Task<ApplyResult> ApplyResultAsync(GatewayResult result);

    Task<PaymentStatusDto> GetPaymentStatusAsync(int orderId, string clientIp);

    Task ChangePaymentMethodAsync(int orderId, string newMethod, string clientIp, bool confirmAbandon);

}
