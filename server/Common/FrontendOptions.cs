using System.ComponentModel.DataAnnotations;

namespace WebShop.Api.Common;

public class FrontendOptions
{
    [Required] public string BaseUrl { get; set; } = null!;
}
