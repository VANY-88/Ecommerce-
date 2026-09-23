namespace WebShop.Api.Common;

public class ApiException : Exception
{
    public int StatusCode { get; }
    public object? Errors { get; }

    public ApiException(int statusCode, string message, object? errors = null) : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }

    public static ApiException BadRequest(string message, object? errors = null) => new(400, message, errors);
    public static ApiException Unauthorized(string message = "Unauthorized") => new(401, message);
    public static ApiException NotFound(string message = "Not found") => new(404, message);
    public static ApiException Forbidden(string message = "Forbidden") => new(403, message);

    // 409 with a machine-readable code (and optional extra fields) in `errors`, for
    // states the client must branch on rather than just display.
    public static ApiException Conflict(string code, string message, int? retryAfterSeconds = null) =>
        new(409, message, retryAfterSeconds == null
            ? new { code }
            : new { code, retryAfterSeconds });
}
