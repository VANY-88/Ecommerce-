using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Categories;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _service.GetAllAsync();
        return Ok(ApiResponse<object>.Ok(categories));
    }

    [HttpGet("{categoryId}")]
    public async Task<IActionResult> GetCategory(int categoryId)
    {
        var category = await _service.GetByIdAsync(categoryId);
        return Ok(ApiResponse<object>.Ok(category));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("add")]
    public async Task<IActionResult> AddCategory(CategoryUpsertDto dto)
    {
        var category = await _service.CreateAsync(dto);
        return Ok(ApiResponse<object>.Ok(category, "Category added successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("update/{categoryId}")]
    public async Task<IActionResult> UpdateCategory(int categoryId, CategoryUpsertDto dto)
    {
        var category = await _service.UpdateAsync(categoryId, dto);
        return Ok(ApiResponse<object>.Ok(category, "Category updated successfully!"));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("delete/{categoryId}")]
    public async Task<IActionResult> DeleteCategory(int categoryId)
    {
        await _service.RemoveAsync(categoryId);
        return Ok(ApiResponse<object>.Ok(null, "Category deleted successfully!"));
    }
}
