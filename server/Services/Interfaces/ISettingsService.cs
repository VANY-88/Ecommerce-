using WebShop.Api.DTOs.Settings;

namespace WebShop.Api.Services.Interfaces;

public interface ISettingsService
{
    Task<AppSettingsDto> GetAsync();
    Task<AppSettingsDto> UpdateAsync(AppSettingsUpdateDto dto);
}
