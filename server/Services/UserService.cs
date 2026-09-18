using Microsoft.AspNetCore.Identity;
using WebShop.Api.Auth;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Auth;
using WebShop.Api.DTOs.Users;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public UserService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, TokenService tokenService, IRefreshTokenRepository refreshTokenRepository)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<(UserDto User, string Token, string RefreshToken)> RegisterAsync(RegisterDto dto)
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
        var refreshToken = await IssueRefreshTokenAsync(user.Id);
        return (ToDto(user, roles), token, refreshToken);
    }

    public async Task<(UserDto User, string Token, string RefreshToken)> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            throw ApiException.BadRequest("User not found!");
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (signInResult.IsLockedOut)
        {
            throw ApiException.BadRequest("Account locked due to too many failed attempts. Try again later.");
        }
        if (!signInResult.Succeeded)
        {
            throw ApiException.BadRequest("Password incorrect!");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);
        var refreshToken = await IssueRefreshTokenAsync(user.Id);
        return (ToDto(user, roles), token, refreshToken);
    }

    public async Task<(string Token, string RefreshToken)> RefreshAsync(string refreshToken)
    {
        var hash = TokenService.HashToken(refreshToken);
        var existing = await _refreshTokenRepository.GetActiveByHashAsync(hash);
        if (existing == null)
        {
            throw ApiException.Unauthorized("Invalid or expired refresh token.");
        }

        var user = await _userManager.FindByIdAsync(existing.UserId);
        if (user == null)
        {
            throw ApiException.Unauthorized("Invalid or expired refresh token.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = _tokenService.GenerateToken(user, roles);
        var newRefreshToken = TokenService.GenerateRefreshToken();
        var newHash = TokenService.HashToken(newRefreshToken);

        existing.RevokedAt = DateTime.UtcNow;
        existing.ReplacedByTokenHash = newHash;
        _refreshTokenRepository.Update(existing);

        await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.Add(TokenService.RefreshTokenLifetime),
        });

        await _refreshTokenRepository.SaveChangesAsync();

        return (newAccessToken, newRefreshToken);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var hash = TokenService.HashToken(refreshToken);
        var existing = await _refreshTokenRepository.GetByHashAsync(hash);
        if (existing == null || existing.RevokedAt != null)
        {
            return;
        }

        existing.RevokedAt = DateTime.UtcNow;
        _refreshTokenRepository.Update(existing);
        await _refreshTokenRepository.SaveChangesAsync();
    }

    private async Task<string> IssueRefreshTokenAsync(string userId)
    {
        var refreshToken = TokenService.GenerateRefreshToken();
        await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            UserId = userId,
            TokenHash = TokenService.HashToken(refreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.Add(TokenService.RefreshTokenLifetime),
        });
        await _refreshTokenRepository.SaveChangesAsync();
        return refreshToken;
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

    public async Task<UserDto> UpdateAsync(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            throw ApiException.NotFound("User not found!");
        }

        if (!string.IsNullOrWhiteSpace(dto.FirstName))
        {
            user.FirstName = Capitalize(dto.FirstName);
        }
        if (!string.IsNullOrWhiteSpace(dto.LastName))
        {
            user.LastName = Capitalize(dto.LastName);
        }
        user.PhoneNumber = dto.Phone;
        user.Address = dto.Address;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw ApiException.BadRequest("Unable to update profile.", result.Errors.Select(e => e.Description));
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
