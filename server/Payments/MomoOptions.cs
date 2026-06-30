namespace WebShop.Api.Payments;

public class MomoOptions
{
    public string PartnerCode { get; set; } = null!;
    public string AccessKey { get; set; } = null!;
    public string SecretKey { get; set; } = null!;
    public string Endpoint { get; set; } = "https://test-payment.momo.vn/v2/gateway/api/create";
    public string RedirectUrl { get; set; } = null!;
    public string IpnUrl { get; set; } = null!;
}
