namespace WebShop.Api.Models.Entities;

public static class PaymentMethods
{
    public const string Cod = "COD";
    public const string VnPay = "VNPay";
    public const string Momo = "Momo";

    public static readonly IReadOnlySet<string> All = new HashSet<string> { Cod, VnPay, Momo };

    public static bool IsGateway(string method) => method is VnPay or Momo;
}

public static class PaymentStatuses
{
    public const string NotApplicable = "NotApplicable";
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
}

public static class OrderStatuses
{
    public const string PendingPayment = "PendingPayment";
    public const string Shipped = "Shipped";
}

public static class AttemptStatuses
{
    public const string Pending = "Pending";
    public const string Succeeded = "Succeeded";
    public const string Failed = "Failed";
    // The gateway took the money but the order was already paid by another attempt
    // (or the paid amount didn't match) — needs a manual refund.
    public const string RefundRequired = "RefundRequired";
}
