namespace WebShop.Api.Common.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;

    public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Swagger UI is served at the root in Development and needs inline
            // scripts/styles + CDN assets; a strict CSP breaks it. Production is
            // API-only (JSON only, no HTML), so it gets a strict policy.
            if (!_env.IsDevelopment())
            {
                headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'";
            }

            return Task.CompletedTask;
        });

        await _next(context);
    }
}
