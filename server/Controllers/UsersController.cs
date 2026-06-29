using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Auth;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var (user, token) = await _service.RegisterAsync(dto);
        return Ok(ApiResponse<object>.WithToken(user, token, "User registered successfully!"));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var (user, token) = await _service.LoginAsync(dto);
        return Ok(ApiResponse<object>.WithToken(user, token, "User logged in successfully!"));
    }

    // Preserved as-is from the original API: despite the name, this returns ALL users, not the caller's profile.
    [Authorize(Roles = "Admin")]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var users = await _service.GetAllAsync();
        return Ok(ApiResponse<object>.Ok(users));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await _service.GetMeAsync(id);
        // Preserved as-is: this endpoint returns the bare user object, not wrapped in ApiResponse.
        return Ok(user);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId != id && !User.IsInRole("Admin"))
        {
            throw ApiException.Forbidden("You can only access your own profile.");
        }
        var user = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<object>.Ok(user));
    }
}
