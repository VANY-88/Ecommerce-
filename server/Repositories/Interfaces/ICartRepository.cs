using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface ICartRepository : IRepository<Cart>
{
    Task<List<Cart>> GetAllByUserWithItemsAsync(string userId);
    Task<Cart?> GetPendingByUserWithItemsAsync(string userId);
}
