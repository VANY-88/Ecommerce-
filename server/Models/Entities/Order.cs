namespace WebShop.Api.Models.Entities;

public class PriceInfo
{
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Tax { get; set; }
    public decimal TaxRate { get; set; }
    public decimal Total { get; set; }
}

public class OrderCustomer
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
}

public class Order
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public string UserId { get; set; } = null!;
    public decimal Price { get; set; }
    public PriceInfo PriceInfo { get; set; } = null!;
    public OrderCustomer? Customer { get; set; }
    public string Status { get; set; } = "Shipped";
    public string PaymentMethod { get; set; } = "COD";
    public string PaymentStatus { get; set; } = "NotApplicable";
    public string? GatewayTransactionId { get; set; }
    public DateTime OrderDate { get; set; }

    public Cart Cart { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
