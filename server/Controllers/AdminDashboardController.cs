using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public AdminDashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("sold-items")]
    public async Task<IActionResult> GetSoldItems()
    {
        var items = await _service.GetSoldItemsAsync();
        return Ok(ApiResponse<object>.Ok(items));
    }

    [HttpGet("profit-by-month")]
    public async Task<IActionResult> GetProfitByMonth()
    {
        var profit = await _service.GetProfitByMonthAsync();
        return Ok(ApiResponse<object>.Ok(profit));
    }

    [HttpGet("best-sellers")]
    public async Task<IActionResult> GetBestSellers()
    {
        var bestSellers = await _service.GetBestSellersAsync();
        return Ok(ApiResponse<object>.Ok(bestSellers));
    }
}
