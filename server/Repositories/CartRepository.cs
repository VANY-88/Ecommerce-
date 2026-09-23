using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class CartRepository : Repository<Cart>, ICartRepository
{
    public CartRepository(ApplicationDbContext context) : base(context) { }

    public Task<Cart?> GetPendingByUserWithItemsAsync(string userId) =>
        Context.Carts.Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Pending");

    public Task<Cart?> GetByIdWithItemsAsync(int cartId) =>
        Context.Carts.Include(c => c.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.Id == cartId);
}
