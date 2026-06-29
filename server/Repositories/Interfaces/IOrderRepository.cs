using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<List<Order>> GetByUserDetailedAsync(string userId);
    Task<Order?> GetByIdDetailedAsync(int orderId);
    Task<List<Order>> GetByUserFlatAsync(string userId);
    Task<List<Order>> GetAllDetailedAsync();
}
