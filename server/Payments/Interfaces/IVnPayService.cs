using Microsoft.AspNetCore.Http;

namespace WebShop.Api.Payments.Interfaces;

public interface IVnPayService
{
    string CreatePaymentUrl(int orderId, decimal amount, string orderInfo, string clientIpAddress);

    bool ValidateSignature(IQueryCollection query, out string responseCode, out string txnRef, out string? transactionNo, out long amount);
}
