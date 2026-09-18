using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(ApplicationDbContext context) : base(context) { }

    public async Task<RefreshToken?> GetActiveByHashAsync(string tokenHash)
    {
        var token = await Context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
        return token != null && token.IsActive ? token : null;
    }

    public Task<RefreshToken?> GetByHashAsync(string tokenHash) =>
        Context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
}
