namespace WebShop.Api.Models.Entities;

public class PaymentAttempt
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Method { get; set; } = null!;
    // Our reference sent to the gateway (vnp_TxnRef / Momo orderId). Unique per attempt,
    // so every callback maps to exactly one attempt.
    public string TxnRef { get; set; } = null!;
    // Amount actually sent to the gateway, in VND. Callbacks are compared against this,
    // never against a recomputed order price.
    public long AmountVnd { get; set; }
    // Exact create date sent to the gateway (yyyyMMddHHmmss, GMT+7); VNPay querydr needs it.
    public string GatewayCreateDate { get; set; } = null!;
    public string? PaymentUrl { get; set; }
    public string Status { get; set; } = AttemptStatuses.Pending;
    public string? ResponseCode { get; set; }
    public string? GatewayTransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
    // When the gateway stops accepting payment on PaymentUrl. Until then (plus a grace
    // period) the attempt may still be paid, so it is never abandoned before this.
    public DateTime ExpiresAt { get; set; }
    public DateTime? LastQueriedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public Order Order { get; set; } = null!;
}
