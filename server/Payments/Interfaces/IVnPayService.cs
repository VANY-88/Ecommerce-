using Microsoft.AspNetCore.Http;

namespace WebShop.Api.Payments.Interfaces;

public interface IVnPayService
{
    GatewayPaymentUrl CreatePaymentUrl(GatewayPaymentRequest request);

    // Returns null when the signature is invalid.
    GatewayResult? ParseCallback(IQueryCollection query);

    Task<GatewayResult> QueryAsync(string txnRef, string gatewayCreateDate, string clientIp);
}
