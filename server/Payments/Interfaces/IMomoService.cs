namespace WebShop.Api.Payments.Interfaces;

public interface IMomoService
{
    Task<string> CreatePaymentUrlAsync(int orderId, decimal amount, string orderInfo);

    bool ValidateSignature(IReadOnlyDictionary<string, string> query, out string? ourOrderId, out string resultCode, out long amount, out string? transId);
}
