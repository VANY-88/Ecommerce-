using WebShop.Api.DTOs.Products;

namespace WebShop.Api.Services.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto> GetByIdAsync(int id);
    Task<List<ProductDto>> GetFeaturedAsync();
    Task<List<ProductDto>> GetByCategoryAsync(int categoryId);
    Task<ProductDto> CreateAsync(ProductUpsertDto dto);
    Task<ProductDto> UpdateAsync(int id, ProductUpsertDto dto);
    Task RemoveAsync(int id);
}
