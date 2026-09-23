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
        var orders = await _orderRepository.GetSettledDetailedAsync();

        return orders
            .SelectMany(o => o.Items.Select(i => new SoldItemDto
            {
                OrderId = o.Id,
                OrderDate = o.OrderDate,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                LineTotal = i.LineTotal,
                CustomerName = CustomerName(o),
            }))
            .OrderByDescending(s => s.OrderDate)
            .ToList();
    }

    public async Task<List<MonthlyProfitDto>> GetProfitByMonthAsync()
    {
        var orders = await _orderRepository.GetSettledDetailedAsync();

        return orders
            .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
            .Select(g => new MonthlyProfitDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(o => o.Items.Sum(i => i.LineTotal)),
                Cost = g.Sum(o => o.Items.Sum(i => i.UnitCost * i.Quantity)),
                Profit = g.Sum(o => o.Items.Sum(i => i.LineTotal - i.UnitCost * i.Quantity)),
                OrdersCount = g.Count(),
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToList();
    }

    public async Task<List<BestSellerDto>> GetBestSellersAsync()
    {
        var orders = await _orderRepository.GetSettledDetailedAsync();

        return orders
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductId)
            .Select(g => new BestSellerDto
            {
                ProductId = g.Key,
                ProductName = g.OrderByDescending(i => i.OrderId).First().ProductName,
                QuantitySold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.LineTotal),
                Profit = g.Sum(i => i.LineTotal - i.UnitCost * i.Quantity),
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
