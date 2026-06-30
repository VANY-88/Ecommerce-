using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Settings;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _service;

    public SettingsController(ISettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _service.GetAsync();
        return Ok(ApiResponse<object>.Ok(settings));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut]
    public async Task<IActionResult> UpdateSettings(AppSettingsUpdateDto dto)
    {
        var settings = await _service.UpdateAsync(dto);
        return Ok(ApiResponse<object>.Ok(settings, "Settings updated successfully!"));
    }
}
