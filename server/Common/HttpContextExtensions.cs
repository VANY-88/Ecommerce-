using System.Net;

namespace WebShop.Api.Common;

public static class HttpContextExtensions
{
    // Client IP in the IPv4 form payment gateways expect (loopback/IPv6 dev traffic
    // becomes 127.0.0.1). Behind a proxy this relies on UseForwardedHeaders.
    public static string GetClientIpV4(this HttpContext context)
    {
        var ip = context.Connection.RemoteIpAddress;
        if (ip == null || IPAddress.IsLoopback(ip))
        {
            return "127.0.0.1";
        }
        if (ip.IsIPv4MappedToIPv6)
        {
            ip = ip.MapToIPv4();
        }
        return ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork ? ip.ToString() : "127.0.0.1";
    }
}
