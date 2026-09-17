using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Products;
using WebShop.Api.Services.Interfaces;
using WebShop.Api.Storage;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;

    private readonly IProductService _service;
    private readonly IImageStorageService _imageStorage;

    public ProductsController(IProductService service, IImageStorageService imageStorage)
    {
        _service = service;
        _imageStorage = imageStorage;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _service.GetAllAsync();
        return Ok(ApiResponse<object>.Ok(products));
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts()
    {
        var products = await _service.GetFeaturedAsync();
        return Ok(ApiResponse<object>.Ok(products));
    }

    [HttpGet("category/{categoryId}")]
    public async Task<IActionResult> GetCategoryProducts(int categoryId)
    {
        var products = await _service.GetByCategoryAsync(categoryId);
        return Ok(ApiResponse<object>.Ok(products));
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetProduct(int productId)
    {
        var product = await _service.GetByIdAsync(productId);
        return Ok(ApiResponse<object>.Ok(product));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            throw ApiException.BadRequest("No file uploaded.");
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            throw ApiException.BadRequest("Only JPEG, PNG, WEBP, or GIF images are allowed.");
        }

        if (file.Length > MaxImageSizeBytes)
        {
            throw ApiException.BadRequest("Image must be 5MB or smaller.");
        }

        var url = await _imageStorage.UploadAsync(file, ct);
        return Ok(ApiResponse<object>.Ok(new { url }, "Image uploaded successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("add")]
    public async Task<IActionResult> AddProduct(ProductUpsertDto dto)
    {
        var product = await _service.CreateAsync(dto);
        return Ok(ApiResponse<object>.Ok(product, "Product added successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("update/{productId}")]
    public async Task<IActionResult> UpdateProduct(int productId, ProductUpsertDto dto)
    {
        var product = await _service.UpdateAsync(productId, dto);
        return Ok(ApiResponse<object>.Ok(product, "Product updated successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("delete/{productId}")]
    public async Task<IActionResult> DeleteProduct(int productId)
    {
        await _service.RemoveAsync(productId);
        return Ok(ApiResponse<object>.Ok(null, "Product deleted successfully!"));
    }
}
