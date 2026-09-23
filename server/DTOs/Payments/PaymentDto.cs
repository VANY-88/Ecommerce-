using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.DTOs.Payments;

public class CreatePaymentRequestDto
{
    [Range(1, int.MaxValue, ErrorMessage = "OrderId must be a positive integer.")]
    public int OrderId { get; set; }

    // The user accepted that a previous, unconfirmed payment may have gone through
    // (required before such an attempt is abandoned; otherwise 409 CONFIRM_ABANDON).
    public bool ConfirmAbandon { get; set; }
}

public class CreatePaymentResponseDto
{
    public string PaymentUrl { get; set; } = null!;
}

public class ChangePaymentMethodDto
{
    [Required]
    public string PaymentMethod { get; set; } = null!;

    public bool ConfirmAbandon { get; set; }
}

public class PaymentStatusDto
{
    public int OrderId { get; set; }
    public string Status { get; set; } = null!;
    public string PaymentMethod { get; set; } = null!;
    public string PaymentStatus { get; set; } = null!;
    // The order still needs paying (continue with the open attempt, retry, or switch).
    public bool CanRetry { get; set; }
    // Method of the attempt still open at the gateway.
    public string? ActiveAttemptMethod { get; set; }
    // Paying again with ActiveAttemptMethod reuses the open URL (it hasn't expired yet).
    // When false while SwitchAfterSeconds > 0, every method has to wait.
    public bool ContinueAllowed { get; set; }
    // Seconds until another method may be chosen (the open attempt could still be paid until then).
    public int SwitchAfterSeconds { get; set; }
    // The open attempt expired without the gateway confirming its outcome.
    public bool WarnPossiblyPaid { get; set; }
}
