using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Auth;

public class RegisterDto
{
    [Required, StringLength(50, MinimumLength = 1)]
    public string FirstName { get; set; } = null!;

    [Required, StringLength(50, MinimumLength = 1)]
    public string LastName { get; set; } = null!;

    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = null!;

    [Required, StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
    public string Password { get; set; } = null!;

    [Phone, StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }
}
