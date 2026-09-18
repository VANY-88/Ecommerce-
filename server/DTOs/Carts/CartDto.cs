using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Carts;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? Image { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class CartDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = null!;
    public List<CartItemDto> Items { get; set; } = new();
}

public class AddItemDto
{
    [Required]
    public string UserId { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "ProductId must be a positive integer.")]
    public int ProductId { get; set; }
}

public class RemoveProductDto
{
    [Required]
    public string UserId { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "ProductId must be a positive integer.")]
    public int ProductId { get; set; }
}

public class RemoveCartItemDto
{
    [Required]
    public string UserId { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "ItemId must be a positive integer.")]
    public int ItemId { get; set; }
}

public class ModifyCartDto
{
    [Required]
    public string UserId { get; set; } = null!;

    [Range(1, int.MaxValue, ErrorMessage = "ItemId must be a positive integer.")]
    public int ItemId { get; set; }

    [Range(1, 10000, ErrorMessage = "Quantity must be between 1 and 10000.")]
    public int Quantity { get; set; }
}
