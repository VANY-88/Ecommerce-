using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class CartRepository : Repository<Cart>, ICartRepository
{
    public CartRepository(ApplicationDbContext context) : base(context) { }

    public Task<List<Cart>> GetAllByUserWithItemsAsync(string userId) =>
        Context.Carts.AsNoTracking().Include(c => c.Items).ThenInclude(i => i.Product)
            .Where(c => c.UserId == userId).ToListAsync();

    public Task<Cart?> GetPendingByUserWithItemsAsync(string userId) =>
        Context.Carts.Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Pending");
}
