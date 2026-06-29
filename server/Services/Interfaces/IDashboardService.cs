using WebShop.Api.DTOs.Admin;

namespace WebShop.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<List<SoldItemDto>> GetSoldItemsAsync();
    Task<List<MonthlyProfitDto>> GetProfitByMonthAsync();
    Task<List<BestSellerDto>> GetBestSellersAsync();
}
