using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        await SeedAdminAsync(userManager, logger);

        // Demo customer account — not privileged, kept as a documented, low-risk
        // convenience for trying out the storefront (see README "Demo Accounts").
        await SeedAccountAsync(userManager, "user@furnitech.com", "User@123", "Demo", "User",
            "0987654321", "456 Furnitech Avenue, Ho Chi Minh City", "User");
    }

    private static async Task SeedAdminAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        const string email = "admin@furnitech.com";
        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            var password = GenerateRandomPassword();
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = "Admin",
                LastName = "Furnitech",
                PhoneNumber = "0123456789",
                Address = "123 Furnitech Street, Ho Chi Minh City",
            };

            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                logger.LogWarning(
                    "Seeded a new Admin account ({Email}) with a randomly generated password: {Password} " +
                    "— this is logged only once. Save it now and change it after first login; it will not be shown again.",
                    email, password);
            }
            else
            {
                logger.LogError(
                    "Failed to seed the Admin account ({Email}): {Errors}",
                    email, string.Join("; ", result.Errors.Select(e => e.Description)));
                return;
            }
        }

        if (!await userManager.IsInRoleAsync(user, "Admin"))
        {
            await userManager.AddToRoleAsync(user, "Admin");
        }
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

    private static string GenerateRandomPassword()
    {
        // Guarantees ASP.NET Identity's default complexity rules (upper/lower/digit/
        // special, 8+ chars — see Program.cs IdentityOptions) while staying random.
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string special = "!@#$%^&*";
        const string all = upper + lower + digits + special;

        var chars = new char[16];
        chars[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        chars[1] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        chars[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        chars[3] = special[RandomNumberGenerator.GetInt32(special.Length)];
        for (var i = 4; i < chars.Length; i++)
        {
            chars[i] = all[RandomNumberGenerator.GetInt32(all.Length)];
        }

        for (var i = chars.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars);
    }
}
