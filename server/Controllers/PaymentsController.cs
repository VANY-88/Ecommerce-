using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Payments;
using WebShop.Api.Models.Entities;
using WebShop.Api.Payments;
using WebShop.Api.Payments.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPaymentService _paymentService;
    private readonly IVnPayService _vnPayService;
    private readonly IMomoService _momoService;
    private readonly FrontendOptions _frontendOptions;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IOrderService orderService,
        IPaymentService paymentService,
        IVnPayService vnPayService,
        IMomoService momoService,
        IOptions<FrontendOptions> frontendOptions,
        ILogger<PaymentsController> logger)
    {
        _orderService = orderService;
        _paymentService = paymentService;
        _vnPayService = vnPayService;
        _momoService = momoService;
        _frontendOptions = frontendOptions.Value;
        _logger = logger;
    }

    private void EnsureOwnerOrAdmin(string userId)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId != userId && !User.IsInRole("Admin"))
        {
            throw ApiException.Forbidden("You can only access your own orders.");
        }
    }

    [Authorize]
    [HttpPost("vnpay/create")]
    public Task<IActionResult> CreateVnPayPayment(CreatePaymentRequestDto dto) =>
        CreatePayment(dto, PaymentMethods.VnPay);

    [Authorize]
    [HttpPost("momo/create")]
    public Task<IActionResult> CreateMomoPayment(CreatePaymentRequestDto dto) =>
        CreatePayment(dto, PaymentMethods.Momo);

    private async Task<IActionResult> CreatePayment(CreatePaymentRequestDto dto, string method)
    {
        var order = await _orderService.GetByIdDetailedAsync(dto.OrderId);
        EnsureOwnerOrAdmin(order.UserId);

        var result = await _paymentService.CreateOrReuseAttemptAsync(order.Id, method, HttpContext.GetClientIpV4(), dto.ConfirmAbandon);
        return Ok(ApiResponse<object>.Ok(result));
    }

    // Browser redirect back from VNPay. Applies the result too, since the IPN can't reach
    // a local dev machine; ApplyResultAsync is idempotent so the IPN arriving as well is fine.
    [HttpGet("vnpay/return")]
    public async Task<IActionResult> VnPayReturn()
    {
        var result = _vnPayService.ParseCallback(Request.Query);
        if (result == null)
        {
            _logger.LogWarning("VNPay return with an invalid signature");
            return RedirectToResult(null, "vnpay");
        }

        var applied = await _paymentService.ApplyResultAsync(result);
        return RedirectToResult(applied.OrderId, "vnpay");
    }

    // Server-to-server notification. Must be registered in the VNPay merchant portal;
    // the response codes follow VNPay's IPN spec (anything but 00/02 makes VNPay retry).
    [HttpGet("vnpay/ipn")]
    public async Task<IActionResult> VnPayIpn()
    {
        try
        {
            var result = _vnPayService.ParseCallback(Request.Query);
            if (result == null)
            {
                return VnPayIpnResponse("97", "Invalid signature");
            }

            var applied = await _paymentService.ApplyResultAsync(result);
            return applied.Status switch
            {
                ApplyResultStatus.NotFound => VnPayIpnResponse("01", "Order not found"),
                ApplyResultStatus.AmountMismatch => VnPayIpnResponse("04", "Invalid amount"),
                ApplyResultStatus.AlreadyFinal => VnPayIpnResponse("02", "Order already confirmed"),
                _ => VnPayIpnResponse("00", "Confirm Success"),
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VNPay IPN failed");
            return VnPayIpnResponse("99", "Unknown error");
        }
    }

    [HttpGet("momo/return")]
    public async Task<IActionResult> MomoReturn()
    {
        var fields = Request.Query.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());
        var result = _momoService.ParseCallback(fields);
        if (result == null)
        {
            _logger.LogWarning("Momo return with an invalid signature");
            return RedirectToResult(null, "momo");
        }

        var applied = await _paymentService.ApplyResultAsync(result);
        return RedirectToResult(applied.OrderId, "momo");
    }

    [HttpPost("momo/ipn")]
    public async Task<IActionResult> MomoIpn([FromBody] Dictionary<string, JsonElement> payload)
    {
        var fields = payload.ToDictionary(kv => kv.Key, kv => kv.Value.ValueKind == JsonValueKind.String
            ? kv.Value.GetString() ?? ""
            : kv.Value.ToString());
        var result = _momoService.ParseCallback(fields);
        if (result == null)
        {
            _logger.LogWarning("Momo IPN with an invalid signature");
            return BadRequest();
        }

        await _paymentService.ApplyResultAsync(result);
        // Momo expects 204 No Content to acknowledge the IPN.
        return NoContent();
    }

    // The client never trusts this redirect for the outcome — it polls the order's
    // payment status — so only the order id is passed along.
    private IActionResult RedirectToResult(int? orderId, string method)
    {
        var query = orderId == null ? $"method={method}" : $"orderId={orderId}&method={method}";
        return Redirect($"{_frontendOptions.BaseUrl}/payment/result?{query}");
    }

    private IActionResult VnPayIpnResponse(string code, string message) =>
        new JsonResult(new Dictionary<string, string> { ["RspCode"] = code, ["Message"] = message });
}
