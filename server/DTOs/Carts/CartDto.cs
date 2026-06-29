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
    public string UserId { get; set; } = null!;
    public int ProductId { get; set; }
}

public class RemoveProductDto
{
    public string UserId { get; set; } = null!;
    public int ProductId { get; set; }
}

public class RemoveCartItemDto
{
    public string UserId { get; set; } = null!;
    public int ItemId { get; set; }
}

public class ModifyCartDto
{
    public string UserId { get; set; } = null!;
    public int ItemId { get; set; }
    public int Quantity { get; set; }
}
