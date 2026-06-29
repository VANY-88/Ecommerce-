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
}
