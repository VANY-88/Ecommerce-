using System.Security.Cryptography;
using System.Text;

namespace WebShop.Api.Payments;

internal static class GatewaySignature
{
    public static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLowerInvariant();
    }

    public static string HmacSha256(string key, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLowerInvariant();
    }

    // Constant-time comparison of two hex signatures (case-insensitive).
    public static bool Matches(string? received, string computed)
    {
        if (string.IsNullOrEmpty(received))
        {
            return false;
        }
        return CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(received.ToLowerInvariant()),
            Encoding.ASCII.GetBytes(computed.ToLowerInvariant()));
    }
}
