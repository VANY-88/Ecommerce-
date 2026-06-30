using WebShop.Api.DTOs.Auth;
using WebShop.Api.DTOs.Users;

namespace WebShop.Api.Services.Interfaces;

public interface IUserService
{
    Task<(UserDto User, string Token)> RegisterAsync(RegisterDto dto);
    Task<(UserDto User, string Token)> LoginAsync(LoginDto dto);
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(string id);
    Task<UserDto> GetMeAsync(string id);
    Task<UserDto> UpdateAsync(string id, UpdateUserDto dto);
}
