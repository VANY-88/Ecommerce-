using WebShop.Api.DTOs.Carts;
using WebShop.Api.DTOs.Users;

namespace WebShop.Api.DTOs.Orders;

public class PriceInfoDto
{
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
}

public class OrderCustomerDto
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
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
    public DateTime OrderDate { get; set; }
    public UserDto? User { get; set; }
    public CartDto? Cart { get; set; }
}

public class CreateOrderDto
{
    public int CartId { get; set; }
    public string UserId { get; set; } = null!;
    public decimal Price { get; set; }
    public PriceInfoDto PriceInfo { get; set; } = null!;
    public OrderCustomerDto? Customer { get; set; }
}

public class UpdateOrderDto
{
    public decimal Price { get; set; }
    public OrderCustomerDto? Customer { get; set; }
}
