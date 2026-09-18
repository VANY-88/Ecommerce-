using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
    public bool IsDiscountActive { get; set; }
    public int Quantity { get; set; }
    public string Description { get; set; } = null!;
    public string Image { get; set; } = null!;
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
}

public class ProductUpsertDto
{
    public string Name { get; set; } = null!;

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "CostPrice cannot be negative.")]
    public decimal CostPrice { get; set; }

    [Range(0, 100, ErrorMessage = "DiscountPercent must be between 0 and 100.")]
    public decimal DiscountPercent { get; set; }

    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Quantity cannot be negative.")]
    public int Quantity { get; set; }
    public string Description { get; set; } = null!;
    public string Image { get; set; } = null!;
    public int CategoryId { get; set; }
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
}
