using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Orders;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public OrdersController(IOrderService service)
    {
        _service = service;
    }

    [HttpGet("allOrder/{userId}")]
    public async Task<IActionResult> GetOrders(string userId)
    {
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
        return Ok(ApiResponse<object>.Ok(order));
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddOrder(CreateOrderDto dto)
    {
        var order = await _service.CreateAsync(dto);
        return Ok(ApiResponse<object>.Ok(order, "Order added successfully!"));
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
        var orders = await _service.GetByUserFlatAsync(userId);
        return Ok(ApiResponse<object>.Ok(orders));
    }
}
