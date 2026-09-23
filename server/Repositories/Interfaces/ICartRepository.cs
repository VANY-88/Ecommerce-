using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetPendingByUserWithItemsAsync(string userId);
    Task<Cart?> GetByIdWithItemsAsync(int cartId);
}
