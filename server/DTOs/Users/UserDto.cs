using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Users;

public class UserDto
{
    public string Id { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class UpdateUserDto
{
    [StringLength(50, MinimumLength = 1)]
    public string? FirstName { get; set; }

    [StringLength(50, MinimumLength = 1)]
    public string? LastName { get; set; }

    [Phone, StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }
}
