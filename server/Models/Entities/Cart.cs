namespace WebShop.Api.Models.Entities;

public class Cart
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
