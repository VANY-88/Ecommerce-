namespace WebShop.Api.Models.Entities;

// Snapshot of a cart line taken when the order is created, so later cart edits,
// price changes or product deletions can't change what the order contains or cost.
public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Image { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal UnitCost { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }

    public Order Order { get; set; } = null!;
}
