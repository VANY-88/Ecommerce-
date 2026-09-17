using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Payments;
using WebShop.Api.Payments.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IVnPayService _vnPayService;
    private readonly IMomoService _momoService;
    private readonly FrontendOptions _frontendOptions;

    public PaymentsController(
        IOrderService orderService,
        IVnPayService vnPayService,
        IMomoService momoService,
        IOptions<FrontendOptions> frontendOptions)
    {
        _orderService = orderService;
        _vnPayService = vnPayService;
        _momoService = momoService;
        _frontendOptions = frontendOptions.Value;
    }

    private void EnsureOwnerOrAdmin(string userId)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId != userId && !User.IsInRole("Admin"))
        {
            throw ApiException.Forbidden("You can only access your own orders.");
        }
    }

    private string FrontendBaseUrl => _frontendOptions.BaseUrl;

    [Authorize]
    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnPayPayment(CreatePaymentRequestDto dto)
    {
        var order = await _orderService.GetByIdDetailedAsync(dto.OrderId);
        EnsureOwnerOrAdmin(order.UserId);

        if (order.PaymentMethod != "VNPay" || order.PaymentStatus != "Pending")
        {
            throw ApiException.BadRequest("This order is not awaiting a VNPay payment.");
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var url = _vnPayService.CreatePaymentUrl(order.Id, order.Price, $"Thanh toan don hang {order.Id}", clientIp);

        return Ok(ApiResponse<object>.Ok(new CreatePaymentResponseDto { PaymentUrl = url }));
    }

    [HttpGet("vnpay/return")]
    public async Task<IActionResult> VnPayReturn()
    {
        var isValid = _vnPayService.ValidateSignature(Request.Query, out var responseCode, out var txnRef, out var transactionNo, out var amount);
        var success = false;

        if (isValid && responseCode == "00" && int.TryParse(txnRef, out var orderId))
        {
            var order = await _orderService.GetByIdDetailedAsync(orderId);
            // Defense in depth: a valid signature alone isn't enough — the paid amount
            // must also match what this order actually expects.
            if (order.Price == amount)
            {
                await _orderService.UpdatePaymentResultAsync(orderId, true, transactionNo);
                success = true;
            }
        }
        else if (isValid && int.TryParse(txnRef, out var failedOrderId))
        {
            await _orderService.UpdatePaymentResultAsync(failedOrderId, false, transactionNo);
        }

        var result = success ? "success" : "fail";
        return Redirect($"{FrontendBaseUrl}/payment/result?orderId={txnRef}&method=vnpay&result={result}");
    }

    [Authorize]
    [HttpPost("momo/create")]
    public async Task<IActionResult> CreateMomoPayment(CreatePaymentRequestDto dto)
    {
        var order = await _orderService.GetByIdDetailedAsync(dto.OrderId);
        EnsureOwnerOrAdmin(order.UserId);

        if (order.PaymentMethod != "Momo" || order.PaymentStatus != "Pending")
        {
            throw ApiException.BadRequest("This order is not awaiting a Momo payment.");
        }

        var url = await _momoService.CreatePaymentUrlAsync(order.Id, order.Price, $"Thanh toan don hang {order.Id}");

        return Ok(ApiResponse<object>.Ok(new CreatePaymentResponseDto { PaymentUrl = url }));
    }

    [HttpGet("momo/return")]
    public async Task<IActionResult> MomoReturn()
    {
        var query = Request.Query.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());
        var (success, ourOrderId) = await ProcessMomoCallback(query);

        var result = success ? "success" : "fail";
        return Redirect($"{FrontendBaseUrl}/payment/result?orderId={ourOrderId}&method=momo&result={result}");
    }

    [HttpPost("momo/ipn")]
    public async Task<IActionResult> MomoIpn([FromBody] Dictionary<string, object> payload)
    {
        var query = payload.ToDictionary(kv => kv.Key, kv => kv.Value?.ToString() ?? "");
        await ProcessMomoCallback(query);
        return Ok();
    }

    private async Task<(bool success, string? orderId)> ProcessMomoCallback(IReadOnlyDictionary<string, string> query)
    {
        var isValid = _momoService.ValidateSignature(query, out var ourOrderId, out var resultCode, out var amount, out var transId);
        if (!isValid || string.IsNullOrEmpty(ourOrderId) || !int.TryParse(ourOrderId, out var orderId))
        {
            return (false, ourOrderId);
        }

        var order = await _orderService.GetByIdDetailedAsync(orderId);
        var success = resultCode == "0" && order.Price == amount;

        await _orderService.UpdatePaymentResultAsync(orderId, success, transId);
        return (success, ourOrderId);
    }
}
