using WebShop.Api.DTOs.Admin;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly IOrderRepository _orderRepository;

    public DashboardService(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<List<SoldItemDto>> GetSoldItemsAsync()
    {
        var orders = await _orderRepository.GetAllDetailedAsync();

        return orders
            .SelectMany(o => o.Cart.Items.Select(i => new SoldItemDto
            {
                OrderId = o.Id,
                OrderDate = o.OrderDate,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "(deleted product)",
                Quantity = i.Quantity,
                UnitPrice = i.Product?.Price ?? 0,
                LineTotal = i.Price,
                CustomerName = CustomerName(o),
            }))
            .OrderByDescending(s => s.OrderDate)
            .ToList();
    }

    public async Task<List<MonthlyProfitDto>> GetProfitByMonthAsync()
    {
        var orders = await _orderRepository.GetAllDetailedAsync();

        return orders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new MonthlyProfitDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(o => o.Cart.Items.Sum(i => i.Price)),
                Cost = g.Sum(o => o.Cart.Items.Sum(i => (i.Product?.CostPrice ?? 0) * i.Quantity)),
                Profit = g.Sum(o => o.Cart.Items.Sum(i => i.Price - (i.Product?.CostPrice ?? 0) * i.Quantity)),
                OrdersCount = g.Count(),
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToList();
    }

    public async Task<List<BestSellerDto>> GetBestSellersAsync()
    {
        var orders = await _orderRepository.GetAllDetailedAsync();

        return orders
            .SelectMany(o => o.Cart.Items)
            .Where(i => i.Product != null)
            .GroupBy(i => i.ProductId)
            .Select(g => new BestSellerDto
            {
                ProductId = g.Key,
                ProductName = g.First().Product.Name,
                QuantitySold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.Price),
                Profit = g.Sum(i => i.Price - i.Product.CostPrice * i.Quantity),
            })
            .OrderByDescending(b => b.QuantitySold)
            .ToList();
    }

    private static string? CustomerName(Order order)
    {
        if (order.Customer != null)
        {
            return $"{order.Customer.FirstName} {order.Customer.LastName}".Trim();
        }
        return order.User == null ? null : $"{order.User.FirstName} {order.User.LastName}".Trim();
    }
}
