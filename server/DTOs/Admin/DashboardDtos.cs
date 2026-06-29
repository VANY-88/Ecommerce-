namespace WebShop.Api.DTOs.Admin;

public class SoldItemDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string? CustomerName { get; set; }
}

public class MonthlyProfitDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal Profit { get; set; }
    public int OrdersCount { get; set; }
}

public class BestSellerDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
}
