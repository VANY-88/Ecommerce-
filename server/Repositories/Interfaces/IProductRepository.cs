using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<List<Product>> GetAllWithCategoryAsync();
    Task<Product?> GetByIdWithCategoryAsync(int id);
    Task<List<Product>> GetFeaturedAsync();
    Task<List<Product>> GetByCategoryAsync(int categoryId);
}
