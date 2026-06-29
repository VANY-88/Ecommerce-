using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context) { }

    public Task<List<Product>> GetAllWithCategoryAsync() =>
        Context.Products.AsNoTracking().Include(p => p.Category).ToListAsync();

    public Task<Product?> GetByIdWithCategoryAsync(int id) =>
        Context.Products.AsNoTracking().Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

    public Task<List<Product>> GetFeaturedAsync() =>
        Context.Products.AsNoTracking().Where(p => p.IsFeatured).ToListAsync();

    public Task<List<Product>> GetByCategoryAsync(int categoryId) =>
        Context.Products.AsNoTracking().Where(p => p.CategoryId == categoryId).ToListAsync();
}
