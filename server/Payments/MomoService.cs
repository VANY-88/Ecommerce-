using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using WebShop.Api.Common;
using WebShop.Api.Payments.Interfaces;

namespace WebShop.Api.Payments;

public class MomoService : IMomoService
{
    // 1000 = initiated (waiting for the user), 7000/7002 = processing, 9000 = authorized.
    private static readonly HashSet<string> ProcessingCodes = new() { "1000", "7000", "7002", "9000" };

    // Final failures returned by the query API. Anything not listed is treated as unknown.
    // Momo creates the order at create time, so 1005 ("expired or doesn't exist") for one
    // of our own references means it expired unpaid.
    private static readonly HashSet<string> FinalFailureCodes = new()
    {
        "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1017", "1026", "1080", "1081", "2019", "4001", "4100",
    };

    private readonly MomoOptions _options;
    private readonly HttpClient _httpClient;
    private readonly ILogger<MomoService> _logger;

    public MomoService(IOptions<MomoOptions> options, HttpClient httpClient, ILogger<MomoService> logger)
    {
        _options = options.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<GatewayPaymentUrl> CreatePaymentUrlAsync(GatewayPaymentRequest request)
    {
        var requestId = request.TxnRef;
        var amountStr = request.AmountVnd.ToString();
        var extraData = "";
        var requestType = "captureWallet";

        var rawSignature =
            $"accessKey={_options.AccessKey}&amount={amountStr}&extraData={extraData}" +
            $"&ipnUrl={_options.IpnUrl}&orderId={request.TxnRef}&orderInfo={request.OrderInfo}" +
            $"&partnerCode={_options.PartnerCode}&redirectUrl={_options.RedirectUrl}" +
            $"&requestId={requestId}&requestType={requestType}";

        var payload = new
        {
            partnerCode = _options.PartnerCode,
            accessKey = _options.AccessKey,
            requestId,
            amount = amountStr,
            orderId = request.TxnRef,
            orderInfo = request.OrderInfo,
            redirectUrl = _options.RedirectUrl,
            ipnUrl = _options.IpnUrl,
            extraData,
            requestType,
            signature = GatewaySignature.HmacSha256(_options.SecretKey, rawSignature),
            orderExpireTime = request.LifetimeMinutes,
            lang = "vi",
        };

        MomoCreateResponse? result;
        try
        {
            // Momo reports business errors as a JSON body on a 4xx, so read the body
            // instead of failing on the status code.
            using var response = await _httpClient.PostAsJsonAsync(_options.Endpoint, payload);
            result = await response.Content.ReadFromJsonAsync<MomoCreateResponse>();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or NotSupportedException)
        {
            _logger.LogWarning(ex, "Momo create for {TxnRef} failed", request.TxnRef);
            throw new ApiException(502, "Could not reach Momo. Please try again in a moment.");
        }

        if (result?.ResultCode != 0 || string.IsNullOrEmpty(result.PayUrl))
        {
            _logger.LogWarning("Momo create for {TxnRef} returned {Code}: {Message}", request.TxnRef, result?.ResultCode, result?.Message);
            throw ApiException.BadRequest($"Momo payment creation failed: {result?.Message ?? "no response"}");
        }

        return new GatewayPaymentUrl(result.PayUrl, GatewayTime.Format(GatewayTime.VietnamNow()));
    }

    public GatewayResult? ParseCallback(IReadOnlyDictionary<string, string> fields)
    {
        string Field(string key) => fields.GetValueOrDefault(key, "");

        var rawSignature =
            $"accessKey={_options.AccessKey}&amount={Field("amount")}" +
            $"&extraData={Field("extraData")}&message={Field("message")}" +
            $"&orderId={Field("orderId")}&orderInfo={Field("orderInfo")}" +
            $"&orderType={Field("orderType")}&partnerCode={Field("partnerCode")}" +
            $"&payType={Field("payType")}&requestId={Field("requestId")}" +
            $"&responseTime={Field("responseTime")}&resultCode={Field("resultCode")}" +
            $"&transId={Field("transId")}";

        if (!GatewaySignature.Matches(Field("signature"), GatewaySignature.HmacSha256(_options.SecretKey, rawSignature)))
        {
            return null;
        }

        var resultCode = Field("resultCode");
        var outcome = resultCode == "0"
            ? GatewayOutcome.Paid
            : ProcessingCodes.Contains(resultCode) ? GatewayOutcome.Processing : GatewayOutcome.Failed;

        return new GatewayResult(
            Field("orderId"),
            outcome,
            long.TryParse(Field("amount"), out var amount) ? amount : 0,
            NullIfEmptyOrZero(Field("transId")),
            resultCode);
    }

    public async Task<GatewayResult> QueryAsync(string txnRef)
    {
        var requestId = Guid.NewGuid().ToString("N");
        var rawSignature =
            $"accessKey={_options.AccessKey}&orderId={txnRef}&partnerCode={_options.PartnerCode}&requestId={requestId}";

        var payload = new
        {
            partnerCode = _options.PartnerCode,
            requestId,
            orderId = txnRef,
            signature = GatewaySignature.HmacSha256(_options.SecretKey, rawSignature),
            lang = "vi",
        };

        // The query response carries no signature, so this relies on the TLS connection to Momo.
        try
        {
            using var response = await _httpClient.PostAsJsonAsync(_options.QueryEndpoint, payload);
            var body = await response.Content.ReadFromJsonAsync<MomoQueryResponse>();
            if (body == null)
            {
                return new GatewayResult(txnRef, GatewayOutcome.Unknown, 0, null, null);
            }

            var code = body.ResultCode.ToString();
            var outcome = code switch
            {
                "0" => GatewayOutcome.Paid,
                "42" => GatewayOutcome.NotFound,
                _ when ProcessingCodes.Contains(code) => GatewayOutcome.Processing,
                _ when FinalFailureCodes.Contains(code) => GatewayOutcome.Failed,
                _ => GatewayOutcome.Unknown,
            };

            return new GatewayResult(txnRef, outcome, body.Amount, body.TransId is > 0 ? body.TransId.ToString() : null, code);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or NotSupportedException)
        {
            _logger.LogWarning(ex, "Momo query for {TxnRef} failed", txnRef);
            return new GatewayResult(txnRef, GatewayOutcome.Unknown, 0, null, null);
        }
    }

    private static string? NullIfEmptyOrZero(string? value) =>
        string.IsNullOrEmpty(value) || value == "0" ? null : value;

    private class MomoCreateResponse
    {
        public int ResultCode { get; set; }
        public string? Message { get; set; }
        public string? PayUrl { get; set; }
    }

    private class MomoQueryResponse
    {
        public int ResultCode { get; set; }
        public string? Message { get; set; }
        public long Amount { get; set; }
        public long? TransId { get; set; }
    }
}
