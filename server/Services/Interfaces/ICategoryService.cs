using WebShop.Api.DTOs.Categories;

namespace WebShop.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CategoryUpsertDto dto);
    Task<CategoryDto> UpdateAsync(int id, CategoryUpsertDto dto);
    Task RemoveAsync(int id);
}
