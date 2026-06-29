using WebShop.Api.DTOs.Carts;

namespace WebShop.Api.Services.Interfaces;

public interface ICartService
{
    Task<CartDto> GetOrCreatePendingAsync(string userId);
    Task<CartDto> AddItemAsync(string userId, int productId);
    Task<CartDto> RemoveFromCartAsync(string userId, int productId);
    Task<CartDto> RemoveItemAsync(string userId, int itemId);
    Task<CartDto> ModifyCartAsync(string userId, int itemId, int quantity);
}
