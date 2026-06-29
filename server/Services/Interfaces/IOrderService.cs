using WebShop.Api.DTOs.Orders;

namespace WebShop.Api.Services.Interfaces;

public interface IOrderService
{
    Task<List<OrderDto>> GetAllByUserDetailedAsync(string userId);
    Task<List<OrderDto>> GetAllDetailedAsync();
    Task<OrderDto> GetByIdDetailedAsync(int orderId);
    Task<OrderDto> CreateAsync(CreateOrderDto dto);
    Task<OrderDto> UpdateAsync(int orderId, UpdateOrderDto dto);
    Task RemoveAsync(int orderId);
    Task<List<OrderDto>> GetByUserFlatAsync(string userId);
}
