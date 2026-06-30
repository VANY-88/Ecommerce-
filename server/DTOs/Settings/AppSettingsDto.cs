namespace WebShop.Api.DTOs.Settings;

public class AppSettingsDto
{
    public decimal TaxRate { get; set; }
    public decimal ShippingFee { get; set; }
}

public class AppSettingsUpdateDto
{
    public decimal TaxRate { get; set; }
    public decimal ShippingFee { get; set; }
}
