using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetActiveByHashAsync(string tokenHash);
    Task<RefreshToken?> GetByHashAsync(string tokenHash);
}
