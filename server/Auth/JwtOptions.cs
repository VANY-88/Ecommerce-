using System.ComponentModel.DataAnnotations;
using WebShop.Api.Common;

namespace WebShop.Api.Auth;

public class JwtOptions
{
    [Required]
    [MinUtf8ByteLength(32, ErrorMessage = "Jwt:Secret must be at least 32 bytes long for HMAC-SHA256.")]
    public string Secret { get; set; } = null!;

    [Required] public string Issuer { get; set; } = null!;
    [Required] public string Audience { get; set; } = null!;
}
