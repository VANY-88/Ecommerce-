using WebShop.Api.DTOs.Products;

namespace WebShop.Api.Services.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(bool includeCostPrice);
    Task<ProductDto> GetByIdAsync(int id, bool includeCostPrice);
    Task<List<ProductDto>> GetFeaturedAsync(bool includeCostPrice);
    Task<List<ProductDto>> GetByCategoryAsync(int categoryId, bool includeCostPrice);
    Task<ProductDto> CreateAsync(ProductUpsertDto dto);
    Task<ProductDto> UpdateAsync(int id, ProductUpsertDto dto);
    Task RemoveAsync(int id);
}
