using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context) { }

    private IQueryable<Order> DetailedQuery() =>
        Context.Orders.AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Cart).ThenInclude(c => c.Items).ThenInclude(i => i.Product);

    public Task<List<Order>> GetByUserDetailedAsync(string userId) =>
        DetailedQuery().Where(o => o.UserId == userId).ToListAsync();

    public Task<Order?> GetByIdDetailedAsync(int orderId) =>
        DetailedQuery().FirstOrDefaultAsync(o => o.Id == orderId);

    public Task<List<Order>> GetByUserFlatAsync(string userId) =>
        Context.Orders.AsNoTracking().Where(o => o.UserId == userId).ToListAsync();

    public Task<List<Order>> GetAllDetailedAsync() =>
        DetailedQuery().ToListAsync();
}
