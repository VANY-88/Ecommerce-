namespace WebShop.Api.Payments.Interfaces;

public interface IMomoService
{
    Task<GatewayPaymentUrl> CreatePaymentUrlAsync(GatewayPaymentRequest request);

    // Returns null when the signature is invalid.
    GatewayResult? ParseCallback(IReadOnlyDictionary<string, string> fields);

    Task<GatewayResult> QueryAsync(string txnRef);
}
