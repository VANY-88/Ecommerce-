using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.Payments;

public class PaymentOptions
{
    // Store prices are in USD; VNPay/Momo only accept VND. The converted amount is
    // computed once per attempt and stored, so callbacks compare against exactly what was sent.
    [Range(1, 1_000_000)] public decimal VndPerUnit { get; set; } = 25000m;

    // How long a gateway payment URL stays payable (sent to VNPay as vnp_ExpireDate and
    // to Momo as orderExpireTime).
    [Range(1, 60)] public int AttemptLifetimeMinutes { get; set; } = 10;

    // Extra wait after a URL's expiry before an unconfirmed attempt may be abandoned, to
    // cover a bank/OTP step that started just before the expiry.
    [Range(0, 3600)] public int ExpiryGraceSeconds { get; set; } = 120;

    // A reuse within this window skips the gateway status query (double click / second tab).
    [Range(0, 600)] public int ReuseWithoutQuerySeconds { get; set; } = 60;

    // Minimum seconds between gateway status queries for the same attempt.
    [Range(0, 600)] public int QueryThrottleSeconds { get; set; } = 10;
}
