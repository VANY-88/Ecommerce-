using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using WebShop.Api.Payments.Interfaces;

namespace WebShop.Api.Payments;

public class VnPayService : IVnPayService
{
    private readonly VnPayOptions _options;

    public VnPayService(IOptions<VnPayOptions> options)
    {
        _options = options.Value;
    }

    public string CreatePaymentUrl(int orderId, decimal amount, string orderInfo, string clientIpAddress)
    {
        var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _options.TmnCode,
            ["vnp_Amount"] = ((long)(amount * 100)).ToString(),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = orderId.ToString(),
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _options.ReturnUrl,
            ["vnp_IpAddr"] = clientIpAddress,
            ["vnp_CreateDate"] = DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss"),
        };

        var signData = string.Join("&", vnpParams.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
        var secureHash = HmacSha512(_options.HashSecret, signData);

        return $"{_options.BaseUrl}?{signData}&vnp_SecureHash={secureHash}";
    }

    public bool ValidateSignature(IQueryCollection query, out string responseCode, out string txnRef, out string? transactionNo, out long amount)
    {
        var receivedHash = query["vnp_SecureHash"].ToString();
        var data = query
            .Where(kv => kv.Key.StartsWith("vnp_") && kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType")
            .OrderBy(kv => kv.Key, StringComparer.Ordinal)
            .Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value.ToString())}");
        var signData = string.Join("&", data);
        var computedHash = HmacSha512(_options.HashSecret, signData);

        responseCode = query["vnp_ResponseCode"].ToString();
        txnRef = query["vnp_TxnRef"].ToString();
        transactionNo = query["vnp_TransactionNo"].ToString();
        amount = long.TryParse(query["vnp_Amount"].ToString(), out var rawAmount) ? rawAmount / 100 : 0;

        return !string.IsNullOrEmpty(receivedHash) &&
               string.Equals(receivedHash, computedHash, StringComparison.OrdinalIgnoreCase);
    }

    private static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
