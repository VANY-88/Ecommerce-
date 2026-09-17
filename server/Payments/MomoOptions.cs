using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.Payments;

public class MomoOptions
{
    [Required] public string PartnerCode { get; set; } = null!;
    [Required] public string AccessKey { get; set; } = null!;
    [Required] public string SecretKey { get; set; } = null!;
    [Required] public string Endpoint { get; set; } = "https://test-payment.momo.vn/v2/gateway/api/create";
    [Required] public string RedirectUrl { get; set; } = null!;
    [Required] public string IpnUrl { get; set; } = null!;
}
