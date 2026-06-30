namespace WebShop.Api.Payments;

public class VnPayOptions
{
    public string TmnCode { get; set; } = null!;
    public string HashSecret { get; set; } = null!;
    public string BaseUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public string ReturnUrl { get; set; } = null!;
}
