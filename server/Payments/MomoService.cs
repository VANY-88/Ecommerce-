using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using WebShop.Api.Common;
using WebShop.Api.Payments.Interfaces;

namespace WebShop.Api.Payments;

public class MomoService : IMomoService
{
    private readonly MomoOptions _options;
    private readonly HttpClient _httpClient;

    public MomoService(IOptions<MomoOptions> options, HttpClient httpClient)
    {
        _options = options.Value;
        _httpClient = httpClient;
    }

    public async Task<string> CreatePaymentUrlAsync(int orderId, decimal amount, string orderInfo)
    {
        var requestId = Guid.NewGuid().ToString();
        var momoOrderId = $"{orderId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        var amountStr = ((long)amount).ToString();
        var extraData = "";
        var requestType = "captureWallet";

        var rawSignature =
            $"accessKey={_options.AccessKey}&amount={amountStr}&extraData={extraData}" +
            $"&ipnUrl={_options.IpnUrl}&orderId={momoOrderId}&orderInfo={orderInfo}" +
            $"&partnerCode={_options.PartnerCode}&redirectUrl={_options.RedirectUrl}" +
            $"&requestId={requestId}&requestType={requestType}";

        var signature = HmacSha256(_options.SecretKey, rawSignature);

        var payload = new
        {
            partnerCode = _options.PartnerCode,
            accessKey = _options.AccessKey,
            requestId,
            amount = amountStr,
            orderId = momoOrderId,
            orderInfo,
            redirectUrl = _options.RedirectUrl,
            ipnUrl = _options.IpnUrl,
            extraData,
            requestType,
            signature,
            lang = "vi",
        };

        var response = await _httpClient.PostAsJsonAsync(_options.Endpoint, payload);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<MomoCreateResponse>();

        if (result?.ResultCode != 0 || string.IsNullOrEmpty(result.PayUrl))
        {
            throw ApiException.BadRequest($"Momo payment creation failed: {result?.Message}");
        }

        return result.PayUrl;
    }

    public bool ValidateSignature(IReadOnlyDictionary<string, string> query, out string? ourOrderId, out string resultCode, out long amount, out string? transId)
    {
        var receivedSignature = query.GetValueOrDefault("signature", "");
        var rawSignature =
            $"accessKey={_options.AccessKey}&amount={query.GetValueOrDefault("amount")}" +
            $"&extraData={query.GetValueOrDefault("extraData")}&message={query.GetValueOrDefault("message")}" +
            $"&orderId={query.GetValueOrDefault("orderId")}&orderInfo={query.GetValueOrDefault("orderInfo")}" +
            $"&orderType={query.GetValueOrDefault("orderType")}&partnerCode={query.GetValueOrDefault("partnerCode")}" +
            $"&payType={query.GetValueOrDefault("payType")}&requestId={query.GetValueOrDefault("requestId")}" +
            $"&responseTime={query.GetValueOrDefault("responseTime")}&resultCode={query.GetValueOrDefault("resultCode")}" +
            $"&transId={query.GetValueOrDefault("transId")}";

        var computed = HmacSha256(_options.SecretKey, rawSignature);

        var momoOrderId = query.GetValueOrDefault("orderId", "");
        ourOrderId = momoOrderId.Split('-').FirstOrDefault();
        resultCode = query.GetValueOrDefault("resultCode", "-1");
        amount = long.TryParse(query.GetValueOrDefault("amount"), out var rawAmount) ? rawAmount : 0;
        transId = query.GetValueOrDefault("transId");

        return !string.IsNullOrEmpty(receivedSignature) &&
               string.Equals(receivedSignature, computed, StringComparison.OrdinalIgnoreCase);
    }

    private static string HmacSha256(string key, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    private class MomoCreateResponse
    {
        public int ResultCode { get; set; }
        public string? Message { get; set; }
        public string? PayUrl { get; set; }
    }
}
