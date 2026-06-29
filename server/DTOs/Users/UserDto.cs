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
