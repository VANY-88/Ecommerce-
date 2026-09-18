using System.Text.Json.Serialization;

namespace WebShop.Api.Common;

public class ApiResponse<T>
{
    public bool Success { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Msg { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Token { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? RefreshToken { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Errors { get; init; }

    public static ApiResponse<T> Ok(T? data = default, string? msg = null) =>
        new() { Success = true, Data = data, Msg = msg };

    public static ApiResponse<T> WithToken(T data, string token, string? msg = null) =>
        new() { Success = true, Data = data, Token = token, Msg = msg };

    public static ApiResponse<T> WithTokens(T data, string token, string refreshToken, string? msg = null) =>
        new() { Success = true, Data = data, Token = token, RefreshToken = refreshToken, Msg = msg };

    public static ApiResponse<T> Fail(string msg, object? errors = null) =>
        new() { Success = false, Msg = msg, Errors = errors };
}
