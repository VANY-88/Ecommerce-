using WebShop.Api.Common;
using WebShop.Api.DTOs.Products;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _repository.GetAllWithCategoryAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto> GetByIdAsync(int id)
    {
        var product = await _repository.GetByIdWithCategoryAsync(id);
        if (product == null)
        {
            throw ApiException.BadRequest("Product not found!");
        }
        return ToDto(product);
    }

    public async Task<List<ProductDto>> GetFeaturedAsync()
    {
        var products = await _repository.GetFeaturedAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<List<ProductDto>> GetByCategoryAsync(int categoryId)
    {
        var products = await _repository.GetByCategoryAsync(categoryId);
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto> CreateAsync(ProductUpsertDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Quantity = dto.Quantity,
            Price = dto.Price,
            CostPrice = dto.CostPrice,
            DiscountPercent = dto.DiscountPercent,
            DiscountStartDate = dto.DiscountStartDate,
            DiscountEndDate = dto.DiscountEndDate,
            Image = dto.Image,
            CategoryId = dto.CategoryId,
            IsFeatured = dto.IsFeatured,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _repository.AddAsync(product);
        await _repository.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductUpsertDto dto)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
        {
            throw ApiException.BadRequest("Product not found!");
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Quantity = dto.Quantity;
        product.Price = dto.Price;
        product.CostPrice = dto.CostPrice;
        product.DiscountPercent = dto.DiscountPercent;
        product.DiscountStartDate = dto.DiscountStartDate;
        product.DiscountEndDate = dto.DiscountEndDate;
        product.CategoryId = dto.CategoryId;
        product.Image = dto.Image;
        product.IsFeatured = dto.IsFeatured;
        product.Status = dto.Status;
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task RemoveAsync(int id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
        {
            throw ApiException.BadRequest("Product not found!");
        }

        _repository.Remove(product);
        await _repository.SaveChangesAsync();
    }

    private static ProductDto ToDto(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Price = product.Price,
        CostPrice = product.CostPrice,
        DiscountPercent = product.DiscountPercent,
        DiscountStartDate = product.DiscountStartDate,
        DiscountEndDate = product.DiscountEndDate,
        IsDiscountActive = IsDiscountActive(product),
        Quantity = product.Quantity,
        Description = product.Description,
        Image = product.Image,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name,
        Status = product.Status,
        IsFeatured = product.IsFeatured,
    };

    private static bool IsDiscountActive(Product product)
    {
        if (product.DiscountPercent <= 0 || product.DiscountStartDate == null || product.DiscountEndDate == null)
        {
            return false;
        }

        var now = DateTime.UtcNow;
        return now >= product.DiscountStartDate.Value && now <= product.DiscountEndDate.Value;
    }
}
