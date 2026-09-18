using System.ComponentModel.DataAnnotations;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.DTOs.Users;

namespace WebShop.Api.DTOs.Orders;

public class PriceInfoDto
{
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Tax { get; set; }
    public decimal TaxRate { get; set; }
    public decimal Total { get; set; }
}

public class OrderCustomerDto
{
    [Required, StringLength(50, MinimumLength = 1)]
    public string FirstName { get; set; } = null!;

    [Required, StringLength(50, MinimumLength = 1)]
    public string LastName { get; set; } = null!;

    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = null!;

    [Required, Phone, StringLength(20)]
    public string Phone { get; set; } = null!;

    [Required, StringLength(300, MinimumLength = 1)]
    public string Address { get; set; } = null!;
}

public class OrderDto
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public string UserId { get; set; } = null!;
    public decimal Price { get; set; }
    public PriceInfoDto PriceInfo { get; set; } = null!;
    public OrderCustomerDto? Customer { get; set; }
    public string Status { get; set; } = null!;
    public string PaymentMethod { get; set; } = null!;
    public string PaymentStatus { get; set; } = null!;
    public string? GatewayTransactionId { get; set; }
    public DateTime OrderDate { get; set; }
    public UserDto? User { get; set; }
    public CartDto? Cart { get; set; }
}

public class CreateOrderDto
{
    [Range(1, int.MaxValue, ErrorMessage = "CartId must be a positive integer.")]
    public int CartId { get; set; }

    [Required]
    public string UserId { get; set; } = null!;

    public decimal Price { get; set; }
    public PriceInfoDto PriceInfo { get; set; } = null!;
    public OrderCustomerDto? Customer { get; set; }
    public string PaymentMethod { get; set; } = "COD";
}

public class UpdateOrderDto
{
    [Range(0, double.MaxValue, ErrorMessage = "Price cannot be negative.")]
    public decimal Price { get; set; }

    public OrderCustomerDto? Customer { get; set; }
}
