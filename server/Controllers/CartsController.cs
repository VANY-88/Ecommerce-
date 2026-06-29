using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/carts")]
[Authorize]
public class CartsController : ControllerBase
{
    private readonly ICartService _service;

    public CartsController(ICartService service)
    {
        _service = service;
    }

    private void EnsureOwnerOrAdmin(string userId)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId != userId && !User.IsInRole("Admin"))
        {
            throw ApiException.Forbidden("You can only access your own cart.");
        }
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetCartInfo(string userId)
    {
        EnsureOwnerOrAdmin(userId);
        var cart = await _service.GetOrCreatePendingAsync(userId);
        return Ok(ApiResponse<object>.Ok(cart));
    }

    [HttpPost("add-item")]
    public async Task<IActionResult> AddItem(AddItemDto dto)
    {
        EnsureOwnerOrAdmin(dto.UserId);
        var cart = await _service.AddItemAsync(dto.UserId, dto.ProductId);
        return Ok(ApiResponse<object>.Ok(cart, "Product added to cart successfully!"));
    }

    [HttpPost("remove")]
    public async Task<IActionResult> RemoveFromCart(RemoveProductDto dto)
    {
        EnsureOwnerOrAdmin(dto.UserId);
        var cart = await _service.RemoveFromCartAsync(dto.UserId, dto.ProductId);
        return Ok(ApiResponse<object>.Ok(cart, "Product removed from cart successfully!"));
    }

    [HttpPost("remove-item")]
    public async Task<IActionResult> RemoveItem(RemoveCartItemDto dto)
    {
        EnsureOwnerOrAdmin(dto.UserId);
        var cart = await _service.RemoveItemAsync(dto.UserId, dto.ItemId);
        return Ok(ApiResponse<object>.Ok(cart, "Item removed from cart successfully!"));
    }

    [HttpPost("modify")]
    public async Task<IActionResult> ModifyCart(ModifyCartDto dto)
    {
        EnsureOwnerOrAdmin(dto.UserId);
        var cart = await _service.ModifyCartAsync(dto.UserId, dto.ItemId, dto.Quantity);
        return Ok(ApiResponse<object>.Ok(cart, "Cart updated successfully!"));
    }
}
