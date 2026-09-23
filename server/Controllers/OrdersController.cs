using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Orders;
using WebShop.Api.DTOs.Payments;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly IPaymentService _paymentService;

    public OrdersController(IOrderService service, IPaymentService paymentService)
    {
        _service = service;
        _paymentService = paymentService;
    }

    private void EnsureOwnerOrAdmin(string userId)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId != userId && !User.IsInRole("Admin"))
        {
            throw ApiException.Forbidden("You can only access your own orders.");
        }
    }

    [HttpGet("allOrder/{userId}")]
    public async Task<IActionResult> GetOrders(string userId)
    {
        EnsureOwnerOrAdmin(userId);
        var orders = await _service.GetAllByUserDetailedAsync(userId);
        if (orders.Count == 0)
        {
            return Ok(ApiResponse<object>.Fail("No orders found!"));
        }
        return Ok(ApiResponse<object>.Ok(orders));
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrder(int orderId)
    {
        var order = await _service.GetByIdDetailedAsync(orderId);
        EnsureOwnerOrAdmin(order.UserId);
        return Ok(ApiResponse<object>.Ok(order));
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddOrder(CreateOrderDto dto)
    {
        EnsureOwnerOrAdmin(dto.UserId);
        var order = await _service.CreateAsync(dto);
        return Ok(ApiResponse<object>.Ok(order, "Order added successfully!"));
    }

    // Checks with the gateway before answering, so a payment that went through while
    // the browser showed an error is picked up here.
    [HttpGet("{orderId}/payment-status")]
    public async Task<IActionResult> GetPaymentStatus(int orderId)
    {
        var order = await _service.GetByIdDetailedAsync(orderId);
        EnsureOwnerOrAdmin(order.UserId);
        var status = await _paymentService.GetPaymentStatusAsync(orderId, HttpContext.GetClientIpV4());
        return Ok(ApiResponse<object>.Ok(status));
    }

    [HttpPut("{orderId}/payment-method")]
    public async Task<IActionResult> ChangePaymentMethod(int orderId, ChangePaymentMethodDto dto)
    {
        var order = await _service.GetByIdDetailedAsync(orderId);
        EnsureOwnerOrAdmin(order.UserId);
        await _paymentService.ChangePaymentMethodAsync(orderId, dto.PaymentMethod, HttpContext.GetClientIpV4(), dto.ConfirmAbandon);
        var updated = await _service.GetByIdDetailedAsync(orderId);
        return Ok(ApiResponse<object>.Ok(updated, "Payment method updated."));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("update/{orderId}")]
    public async Task<IActionResult> UpdateOrder(int orderId, UpdateOrderDto dto)
    {
        var order = await _service.UpdateAsync(orderId, dto);
        return Ok(ApiResponse<object>.Ok(order, "Order updated successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("delete/{orderId}")]
    public async Task<IActionResult> DeleteOrder(int orderId)
    {
        await _service.RemoveAsync(orderId);
        return Ok(ApiResponse<object>.Ok(null, "Order deleted successfully!"));
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetOrdersByUser(string userId)
    {
        EnsureOwnerOrAdmin(userId);
        var orders = await _service.GetByUserFlatAsync(userId);
        return Ok(ApiResponse<object>.Ok(orders));
    }
}
