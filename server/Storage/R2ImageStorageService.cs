using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace WebShop.Api.Storage;

public class R2ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly R2Options _options;

    public R2ImageStorageService(IAmazonS3 s3, IOptions<R2Options> options)
    {
        _s3 = s3;
        _options = options.Value;
    }

    public async Task<string> UploadAsync(IFormFile file, CancellationToken ct = default)
    {
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var key = $"products/{fileName}";

        await using var stream = file.OpenReadStream();
        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType,
        };

        await _s3.PutObjectAsync(request, ct);

        return $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}";
    }
}
