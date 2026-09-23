using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.Payments;

public class VnPayOptions
{
    [Required] public string TmnCode { get; set; } = null!;
    [Required] public string HashSecret { get; set; } = null!;
    [Required] public string BaseUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    [Required] public string ReturnUrl { get; set; } = null!;
    // Merchant web API used for querydr (transaction status lookup).
    [Required] public string ApiUrl { get; set; } = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
}
