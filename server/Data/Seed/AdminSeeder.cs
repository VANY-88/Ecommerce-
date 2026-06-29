using Microsoft.AspNetCore.Identity;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        await SeedAccountAsync(userManager, "admin@furnitech.com", "Admin@123", "Admin", "Furnitech",
            "0123456789", "123 Furnitech Street, Ho Chi Minh City", "Admin");

        await SeedAccountAsync(userManager, "user@furnitech.com", "User@123", "Demo", "User",
            "0987654321", "456 Furnitech Avenue, Ho Chi Minh City", "User");
    }

    private static async Task SeedAccountAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName,
        string phone,
        string address,
        string role)
    {
        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                PhoneNumber = phone,
                Address = address,
            };

            await userManager.CreateAsync(user, password);
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }
}
