using WebShop.Api.DTOs.Auth;
using WebShop.Api.DTOs.Users;

namespace WebShop.Api.Services.Interfaces;

public interface IUserService
{
    Task<(UserDto User, string Token, string RefreshToken)> RegisterAsync(RegisterDto dto);
    Task<(UserDto User, string Token, string RefreshToken)> LoginAsync(LoginDto dto);
    Task<(string Token, string RefreshToken)> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(string id);
    Task<UserDto> GetMeAsync(string id);
    Task<UserDto> UpdateAsync(string id, UpdateUserDto dto);
}
