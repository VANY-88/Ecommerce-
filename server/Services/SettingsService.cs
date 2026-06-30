using WebShop.Api.Common;
using WebShop.Api.DTOs.Settings;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class SettingsService : ISettingsService
{
    private const int SettingsId = 1;

    private readonly IRepository<AppSettings> _repository;

    public SettingsService(IRepository<AppSettings> repository)
    {
        _repository = repository;
    }

    public async Task<AppSettingsDto> GetAsync()
    {
        var settings = await _repository.GetByIdAsync(SettingsId);
        if (settings == null)
        {
            throw ApiException.BadRequest("Application settings have not been initialized.");
        }
        return ToDto(settings);
    }

    public async Task<AppSettingsDto> UpdateAsync(AppSettingsUpdateDto dto)
    {
        var settings = await _repository.GetByIdAsync(SettingsId);
        if (settings == null)
        {
            throw ApiException.BadRequest("Application settings have not been initialized.");
        }

        settings.TaxRate = dto.TaxRate;
        settings.ShippingFee = dto.ShippingFee;
        settings.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();
        return ToDto(settings);
    }

    private static AppSettingsDto ToDto(AppSettings settings) => new()
    {
        TaxRate = settings.TaxRate,
        ShippingFee = settings.ShippingFee,
    };
}
