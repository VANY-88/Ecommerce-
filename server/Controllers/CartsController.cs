using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/carts")]
public class CartsController : ControllerBase
{
    private readonly ICartService _service;

    public CartsController(ICartService service)
    {
        _service = service;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetCartInfo(string userId)
    {
        var cart = await _service.GetOrCreatePendingAsync(userId);
        return Ok(ApiResponse<object>.Ok(cart));
    }

    [HttpPost("add-item")]
    public async Task<IActionResult> AddItem(AddItemDto dto)
    {
        var cart = await _service.AddItemAsync(dto.UserId, dto.ProductId);
        return Ok(ApiResponse<object>.Ok(cart, "Product added to cart successfully!"));
    }

    [HttpPost("remove")]
    public async Task<IActionResult> RemoveFromCart(RemoveProductDto dto)
    {
        var cart = await _service.RemoveFromCartAsync(dto.UserId, dto.ProductId);
        return Ok(ApiResponse<object>.Ok(cart, "Product removed from cart successfully!"));
    }

    [HttpPost("remove-item")]
    public async Task<IActionResult> RemoveItem(RemoveCartItemDto dto)
    {
        var cart = await _service.RemoveItemAsync(dto.UserId, dto.ItemId);
        return Ok(ApiResponse<object>.Ok(cart, "Item removed from cart successfully!"));
    }

    [HttpPost("modify")]
    public async Task<IActionResult> ModifyCart(ModifyCartDto dto)
    {
        var cart = await _service.ModifyCartAsync(dto.UserId, dto.ItemId, dto.Quantity);
        return Ok(ApiResponse<object>.Ok(cart, "Cart updated successfully!"));
    }
}
