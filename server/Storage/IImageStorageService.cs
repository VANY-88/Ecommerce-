namespace WebShop.Api.Storage;

public interface IImageStorageService
{
    Task<string> UploadAsync(IFormFile file, CancellationToken ct = default);
}
