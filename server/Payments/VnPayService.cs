using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using WebShop.Api.Payments.Interfaces;

namespace WebShop.Api.Payments;

public class VnPayService : IVnPayService
{
    private readonly VnPayOptions _options;
    private readonly HttpClient _httpClient;
    private readonly ILogger<VnPayService> _logger;

    public VnPayService(IOptions<VnPayOptions> options, HttpClient httpClient, ILogger<VnPayService> logger)
    {
        _options = options.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    public GatewayPaymentUrl CreatePaymentUrl(GatewayPaymentRequest request)
    {
        var now = GatewayTime.VietnamNow();
        var createDate = GatewayTime.Format(now);
        var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _options.TmnCode,
            ["vnp_Amount"] = (request.AmountVnd * 100).ToString(),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = request.TxnRef,
            ["vnp_OrderInfo"] = request.OrderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _options.ReturnUrl,
            ["vnp_IpAddr"] = request.ClientIp,
            ["vnp_CreateDate"] = createDate,
            ["vnp_ExpireDate"] = GatewayTime.Format(now.AddMinutes(request.LifetimeMinutes)),
        };

        var signData = BuildSignData(vnpParams);
        var secureHash = GatewaySignature.HmacSha512(_options.HashSecret, signData);

        return new GatewayPaymentUrl($"{_options.BaseUrl}?{signData}&vnp_SecureHash={secureHash}", createDate);
    }

    public GatewayResult? ParseCallback(IQueryCollection query)
    {
        var fields = query
            .Where(kv => kv.Key.StartsWith("vnp_") && kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType")
            .ToDictionary(kv => kv.Key, kv => kv.Value.ToString());
        var computedHash = GatewaySignature.HmacSha512(
            _options.HashSecret,
            BuildSignData(new SortedDictionary<string, string>(fields, StringComparer.Ordinal)));

        if (!GatewaySignature.Matches(query["vnp_SecureHash"].ToString(), computedHash))
        {
            return null;
        }

        var responseCode = fields.GetValueOrDefault("vnp_ResponseCode", "");
        var transactionStatus = fields.GetValueOrDefault("vnp_TransactionStatus", "");
        // "00" on both is the only paid state; "24" is the customer cancelling; anything
        // else coming back through return/IPN is a final failure for this attempt.
        var outcome = responseCode == "00" && transactionStatus == "00"
            ? GatewayOutcome.Paid
            : GatewayOutcome.Failed;

        return new GatewayResult(
            fields.GetValueOrDefault("vnp_TxnRef", ""),
            outcome,
            ParseAmount(fields.GetValueOrDefault("vnp_Amount")),
            NullIfEmptyOrZero(fields.GetValueOrDefault("vnp_TransactionNo")),
            responseCode);
    }

    public async Task<GatewayResult> QueryAsync(string txnRef, string gatewayCreateDate, string clientIp)
    {
        var requestId = Guid.NewGuid().ToString("N");
        var createDate = GatewayTime.Format(GatewayTime.VietnamNow());
        const string version = "2.1.0";
        const string command = "querydr";
        var orderInfo = $"Query {txnRef}";

        // querydr signs a pipe-joined string, not the &-joined query format of the pay URL.
        var signData = string.Join("|", requestId, version, command, _options.TmnCode, txnRef,
            gatewayCreateDate, createDate, clientIp, orderInfo);

        var payload = new Dictionary<string, string>
        {
            ["vnp_RequestId"] = requestId,
            ["vnp_Version"] = version,
            ["vnp_Command"] = command,
            ["vnp_TmnCode"] = _options.TmnCode,
            ["vnp_TxnRef"] = txnRef,
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_TransactionDate"] = gatewayCreateDate,
            ["vnp_CreateDate"] = createDate,
            ["vnp_IpAddr"] = clientIp,
            ["vnp_SecureHash"] = GatewaySignature.HmacSha512(_options.HashSecret, signData),
        };

        try
        {
            using var response = await _httpClient.PostAsJsonAsync(_options.ApiUrl, payload);
            var body = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>();
            if (body == null)
            {
                return Unknown(txnRef, null);
            }

            string Field(string key) => body.TryGetValue(key, out var v) ? v.ToString() : "";

            var responseCode = Field("vnp_ResponseCode");
            if (responseCode == "91")
            {
                return new GatewayResult(txnRef, GatewayOutcome.NotFound, 0, null, responseCode);
            }
            if (responseCode != "00")
            {
                _logger.LogWarning("VNPay querydr for {TxnRef} returned {Code}: {Message}", txnRef, responseCode, Field("vnp_Message"));
                return Unknown(txnRef, responseCode);
            }

            var responseSignData = string.Join("|",
                Field("vnp_ResponseId"), Field("vnp_Command"), responseCode, Field("vnp_Message"),
                Field("vnp_TmnCode"), Field("vnp_TxnRef"), Field("vnp_Amount"), Field("vnp_BankCode"),
                Field("vnp_PayDate"), Field("vnp_TransactionNo"), Field("vnp_TransactionType"),
                Field("vnp_TransactionStatus"), Field("vnp_OrderInfo"), Field("vnp_PromotionCode"),
                Field("vnp_PromotionAmount"));
            if (!GatewaySignature.Matches(Field("vnp_SecureHash"), GatewaySignature.HmacSha512(_options.HashSecret, responseSignData)))
            {
                _logger.LogWarning("VNPay querydr for {TxnRef} returned an invalid signature", txnRef);
                return Unknown(txnRef, responseCode);
            }

            var transactionStatus = Field("vnp_TransactionStatus");
            var outcome = transactionStatus switch
            {
                "00" => GatewayOutcome.Paid,
                "02" => GatewayOutcome.Failed,
                // 01 = not completed yet, 07 = held for fraud review; anything else is
                // refund-related and shouldn't happen for an unpaid attempt.
                "01" or "07" => GatewayOutcome.Processing,
                _ => GatewayOutcome.Unknown,
            };

            return new GatewayResult(txnRef, outcome, ParseAmount(Field("vnp_Amount")),
                NullIfEmptyOrZero(Field("vnp_TransactionNo")), transactionStatus);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or NotSupportedException)
        {
            _logger.LogWarning(ex, "VNPay querydr for {TxnRef} failed", txnRef);
            return Unknown(txnRef, null);
        }
    }

    // VNPay's reference implementation form-encodes keys and values (space -> '+').
    private static string BuildSignData(SortedDictionary<string, string> fields) =>
        string.Join("&", fields
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));

    private static long ParseAmount(string? raw) =>
        long.TryParse(raw, out var minorUnits) ? minorUnits / 100 : 0;

    private static string? NullIfEmptyOrZero(string? value) =>
        string.IsNullOrEmpty(value) || value == "0" ? null : value;

    private static GatewayResult Unknown(string txnRef, string? code) =>
        new(txnRef, GatewayOutcome.Unknown, 0, null, code);
}
