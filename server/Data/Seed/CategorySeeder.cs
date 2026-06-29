using Microsoft.EntityFrameworkCore;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data.Seed;

public static class CategorySeeder
{
    private static readonly string[] Names = { "Furniture", "Decoration", "Storage", "Lighting" };

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        foreach (var name in Names)
        {
            if (!await context.Categories.AnyAsync(c => c.Name == name))
            {
                context.Categories.Add(new Category
                {
                    Name = name,
                    Status = "Active",
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });
            }
        }

        await context.SaveChangesAsync();
    }
}
