using Microsoft.AspNetCore.Identity;
using WebShop.Api.Auth;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Auth;
using WebShop.Api.DTOs.Users;
using WebShop.Api.Models.Entities;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;

    public UserService(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<(UserDto User, string Token)> RegisterAsync(RegisterDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
        {
            throw ApiException.BadRequest("Email already exists!");
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = Capitalize(dto.FirstName),
            LastName = Capitalize(dto.LastName),
            PhoneNumber = dto.Phone,
            Address = dto.Address,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            throw ApiException.BadRequest("Unable to register user.", result.Errors.Select(e => e.Description));
        }

        await _userManager.AddToRoleAsync(user, "User");
        var roles = await _userManager.GetRolesAsync(user);

        var token = _tokenService.GenerateToken(user, roles);
        return (ToDto(user, roles), token);
    }

    public async Task<(UserDto User, string Token)> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            throw ApiException.BadRequest("User not found!");
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
        {
            throw ApiException.BadRequest("Password incorrect!");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);
        return (ToDto(user, roles), token);
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = _userManager.Users.ToList();
        var dtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            dtos.Add(ToDto(user, roles));
        }
        return dtos;
    }

    public async Task<UserDto> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw ApiException.NotFound("User not found!");
        }
        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task<UserDto> GetMeAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw ApiException.NotFound("User not found");
        }
        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    private static string Capitalize(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToUpper(value[0]) + value[1..];

    private static UserDto ToDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email!,
        Phone = user.PhoneNumber,
        Address = user.Address,
        Roles = roles.ToList(),
    };
}
