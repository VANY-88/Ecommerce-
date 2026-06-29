namespace WebShop.Api.DTOs.Categories;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
}

public class CategoryUpsertDto
{
    public string Name { get; set; } = null!;
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
}
