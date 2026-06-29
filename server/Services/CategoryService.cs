using WebShop.Api.Common;
using WebShop.Api.DTOs.Categories;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _repository.GetAllAsync();
        return categories.Select(ToDto).ToList();
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
        {
            throw ApiException.BadRequest("Category not found!");
        }
        return ToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(CategoryUpsertDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Status = dto.Status,
            IsFeatured = dto.IsFeatured,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _repository.AddAsync(category);
        await _repository.SaveChangesAsync();
        return ToDto(category);
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategoryUpsertDto dto)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
        {
            throw ApiException.BadRequest("Category not found!");
        }

        category.Name = dto.Name;
        category.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();
        return ToDto(category);
    }

    public async Task RemoveAsync(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null)
        {
            throw ApiException.BadRequest("Category not found!");
        }

        if (await _repository.HasProductsAsync(id))
        {
            throw ApiException.BadRequest("Cannot delete a category that still has products.");
        }

        _repository.Remove(category);
        await _repository.SaveChangesAsync();
    }

    private static CategoryDto ToDto(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Status = category.Status,
        IsFeatured = category.IsFeatured,
    };
}
