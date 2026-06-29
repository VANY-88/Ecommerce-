using WebShop.Api.Models.Entities;

namespace WebShop.Api.Repositories.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<bool> HasProductsAsync(int categoryId);
}
