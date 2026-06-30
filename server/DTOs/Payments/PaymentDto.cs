namespace WebShop.Api.DTOs.Payments;

public class CreatePaymentRequestDto
{
    public int OrderId { get; set; }
}

public class CreatePaymentResponseDto
{
    public string PaymentUrl { get; set; } = null!;
}
