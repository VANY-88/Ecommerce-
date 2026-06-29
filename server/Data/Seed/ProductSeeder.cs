using Microsoft.EntityFrameworkCore;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data.Seed;

public static class ProductSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var categories = await context.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);
        var existingNames = await context.Products.Select(p => p.Name).ToListAsync();

        var products = new List<Product>
        {
            // Furniture
            new() { Name = "Sakarias", Price = 392m, Quantity = 50, Description = "This is the sample product description on 2 lines.", Image = "./assets/chair.png", CategoryId = categories["Furniture"] },
            new() { Name = "Sleeper Sofa", Price = 1599m, Quantity = 50, Description = "A stylish and comfortable modern sofa perfect for any living room.", Image = "https://www.ikea.com/us/en/images/products/finnala-sleeper-sofa-gunnared-beige__0686037_pe721537_s5.jpg?f=xl", CategoryId = categories["Furniture"] },
            new() { Name = "Gaming Chair", Price = 389.55m, Quantity = 50, Description = "A sleek and ergonomic chair for comfortable gaming sessions.", Image = "https://www.ikea.com/us/en/images/products/styrspel-gaming-chair-dark-gray-gray__1115362_pe872046_s5.jpg?f=xl", CategoryId = categories["Furniture"] },
            new() { Name = "Table Set", Price = 645.24m, Quantity = 50, Description = "A classic wooden dining set for your dining room or patio.", Image = "https://www.ikea.com/us/en/images/products/norden-froesvi-table-and-4-chairs-birch-knisa-dark-gray__1328452_pe944787_s5.jpg?f=xl", CategoryId = categories["Furniture"] },

            // Decoration
            new() { Name = "Wall Art Print", Price = 49.99m, Quantity = 50, Description = "A framed wall art print that adds character to any room.", Image = "https://www.ikea.com/us/en/images/products/bjoerksta-picture-with-frame-birch-pine-forest__1124566_pe874296_s5.jpg?f=xl", CategoryId = categories["Decoration"] },
            new() { Name = "Ceramic Vase", Price = 24.99m, Quantity = 50, Description = "A handcrafted ceramic vase, perfect for fresh or dried flowers.", Image = "https://www.ikea.com/us/en/images/products/dyrgrund-vase-light-green__1067062_pe857832_s5.jpg?f=xl", CategoryId = categories["Decoration"] },
            new() { Name = "Round Wall Mirror", Price = 89.99m, Quantity = 50, Description = "A round mirror with a slim frame that brightens up your space.", Image = "https://www.ikea.com/us/en/images/products/langesund-mirror-black__0732478_pe740432_s5.jpg?f=xl", CategoryId = categories["Decoration"] },
            new() { Name = "Throw Pillow Set", Price = 34.99m, Quantity = 50, Description = "A set of soft decorative throw pillows for your sofa or bed.", Image = "https://www.ikea.com/us/en/images/products/gurli-cushion-cover-light-pink__0985738_pe824179_s5.jpg?f=xl", CategoryId = categories["Decoration"] },

            // Storage
            new() { Name = "Bookshelf Unit", Price = 159.99m, Quantity = 50, Description = "A spacious bookshelf unit to organize your books and decor.", Image = "https://www.ikea.com/us/en/images/products/billy-bookcase-white__0625128_pe692385_s5.jpg?f=xl", CategoryId = categories["Storage"] },
            new() { Name = "Storage Cabinet", Price = 219.99m, Quantity = 50, Description = "A multi-purpose storage cabinet with adjustable shelves.", Image = "https://www.ikea.com/us/en/images/products/havsta-storage-combination-w-glass-doors-gray__0727830_pe735055_s5.jpg?f=xl", CategoryId = categories["Storage"] },
            new() { Name = "Shoe Rack", Price = 59.99m, Quantity = 50, Description = "A compact shoe rack that keeps your entryway tidy.", Image = "https://www.ikea.com/us/en/images/products/hemnes-shoe-cabinet-with-2-compartments-white__0735866_pe740129_s5.jpg?f=xl", CategoryId = categories["Storage"] },
            new() { Name = "Storage Bin Set", Price = 29.99m, Quantity = 50, Description = "A set of stackable storage bins for closets and shelves.", Image = "https://www.ikea.com/us/en/images/products/samla-box-clear__0727768_pe735008_s5.jpg?f=xl", CategoryId = categories["Storage"] },

            // Lighting
            new() { Name = "Modern Floor Lamp", Price = 79.99m, Quantity = 50, Description = "A modern floor lamp that adds warm ambient lighting.", Image = "https://www.ikea.com/us/en/images/products/nymane-floor-lamp-with-led-bulb-black__0738283_pe741907_s5.jpg?f=xl", CategoryId = categories["Lighting"] },
            new() { Name = "Pendant Light", Price = 44.99m, Quantity = 50, Description = "A stylish pendant light, ideal for kitchens and dining areas.", Image = "https://www.ikea.com/us/en/images/products/hektar-pendant-lamp-dark-gray__0731065_pe739208_s5.jpg?f=xl", CategoryId = categories["Lighting"] },
            new() { Name = "Table Lamp", Price = 34.99m, Quantity = 50, Description = "A compact table lamp that fits perfectly on any nightstand.", Image = "https://www.ikea.com/us/en/images/products/nymo-lamp-shade-white__0727578_pe734895_s5.jpg?f=xl", CategoryId = categories["Lighting"] },
            new() { Name = "LED Strip Light", Price = 19.99m, Quantity = 50, Description = "A flexible LED strip light for accent lighting around the home.", Image = "https://www.ikea.com/us/en/images/products/ledberg-led-light-strip-multicolor__0989343_pe825976_s5.jpg?f=xl", CategoryId = categories["Lighting"] },
        };

        var toAdd = products.Where(p => !existingNames.Contains(p.Name)).ToList();

        foreach (var product in toAdd)
        {
            product.CostPrice = Math.Round(product.Price * 0.6m, 2);
            product.Status = "Active";
            product.IsFeatured = true;
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;
        }

        if (toAdd.Count > 0)
        {
            context.Products.AddRange(toAdd);
            await context.SaveChangesAsync();
        }

        var missingCostPrice = await context.Products.Where(p => p.CostPrice == 0).ToListAsync();
        if (missingCostPrice.Count > 0)
        {
            foreach (var product in missingCostPrice)
            {
                product.CostPrice = Math.Round(product.Price * 0.6m, 2);
            }
            await context.SaveChangesAsync();
        }
    }
}
