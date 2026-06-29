namespace WebShop.Api.Models.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
    public int Quantity { get; set; }
    public string Description { get; set; } = null!;
    public string Image { get; set; } = null!;
    public int CategoryId { get; set; }
    public string? Status { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Category Category { get; set; } = null!;
}
