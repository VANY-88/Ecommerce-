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
            .Include(o => o.Items);

    public Task<List<Order>> GetByUserDetailedAsync(string userId) =>
        DetailedQuery().Where(o => o.UserId == userId).ToListAsync();

    public Task<Order?> GetByIdDetailedAsync(int orderId) =>
        DetailedQuery().FirstOrDefaultAsync(o => o.Id == orderId);

    public Task<List<Order>> GetByUserFlatAsync(string userId) =>
        Context.Orders.AsNoTracking().Where(o => o.UserId == userId).ToListAsync();

    public Task<List<Order>> GetAllDetailedAsync() =>
        DetailedQuery().ToListAsync();

    // Orders that count as sales: paid online, or cash on delivery.
    public Task<List<Order>> GetSettledDetailedAsync() =>
        DetailedQuery()
            .Where(o => o.PaymentStatus == PaymentStatuses.Paid || o.PaymentStatus == PaymentStatuses.NotApplicable)
            .ToListAsync();

    public Task<Order?> GetByCartIdAsync(int cartId) =>
        Context.Orders.FirstOrDefaultAsync(o => o.CartId == cartId);

    // Any attempt counts: even a Failed/abandoned one may still be paid late, and its
    // callback must find the order and its original price.
    public Task<bool> HasPaymentActivityAsync(int orderId) =>
        Context.PaymentAttempts.AnyAsync(a => a.OrderId == orderId);
}
