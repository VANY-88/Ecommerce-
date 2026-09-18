using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WebShop.Api.Common;

// [MinLength] checks char count, which isn't the same as byte count for a
// key used as HMAC signing material (multi-byte UTF-8 chars would pass a
// char-length check while still being short on entropy).
public class MinUtf8ByteLengthAttribute : ValidationAttribute
{
    private readonly int _minBytes;

    public MinUtf8ByteLengthAttribute(int minBytes)
    {
        _minBytes = minBytes;
    }

    public override bool IsValid(object? value)
    {
        if (value is not string s)
        {
            return false;
        }

        return Encoding.UTF8.GetByteCount(s) >= _minBytes;
    }

    public override string FormatErrorMessage(string name) =>
        ErrorMessage ?? $"{name} must be at least {_minBytes} bytes (UTF-8) long.";
}
