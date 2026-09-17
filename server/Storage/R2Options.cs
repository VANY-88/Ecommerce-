using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.Storage;

public class R2Options
{
    [Required] public string AccountId { get; set; } = null!;
    [Required] public string AccessKeyId { get; set; } = null!;
    [Required] public string SecretAccessKey { get; set; } = null!;
    [Required] public string BucketName { get; set; } = null!;
    [Required] public string PublicBaseUrl { get; set; } = null!;
}
