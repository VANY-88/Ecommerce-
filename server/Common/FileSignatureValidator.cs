namespace WebShop.Api.Common;

// Validates the actual bytes of an uploaded file against known image
// signatures, since the client-supplied Content-Type header (checked
// separately by callers) is trivially spoofable.
public static class FileSignatureValidator
{
    public static async Task<bool> IsAllowedImageAsync(Stream stream)
    {
        var header = new byte[12];
        var bytesRead = await stream.ReadAsync(header.AsMemory(0, 12));
        if (bytesRead < 4)
        {
            return false;
        }

        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) // JPEG
        {
            return true;
        }

        if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) // PNG
        {
            return true;
        }

        if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) // GIF
        {
            return true;
        }

        if (bytesRead == 12 &&
            header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 && // "RIFF"
            header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) // "WEBP"
        {
            return true;
        }

        return false;
    }
}
