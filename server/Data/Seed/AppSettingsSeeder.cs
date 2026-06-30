using Microsoft.EntityFrameworkCore;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data.Seed;

public static class AppSettingsSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!await context.AppSettings.AnyAsync())
        {
            context.AppSettings.Add(new AppSettings
            {
                TaxRate = 0.10m,
                ShippingFee = 5m,
                UpdatedAt = DateTime.UtcNow,
            });

            await context.SaveChangesAsync();
        }
    }
}
