using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Auth;

public class LoginDto
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = null!;

    [Required, StringLength(100, MinimumLength = 1)]
    public string Password { get; set; } = null!;
}
