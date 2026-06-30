namespace WebShop.Api.Models.Entities;

public class AppSettings
{
    public int Id { get; set; }
    public decimal TaxRate { get; set; }
    public decimal ShippingFee { get; set; }
    public DateTime UpdatedAt { get; set; }
}
