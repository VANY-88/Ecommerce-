using Microsoft.AspNetCore.Identity;
using WebShop.Api.Common;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.DTOs.Orders;
using WebShop.Api.DTOs.Users;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class OrderService : IOrderService
{
    private static readonly HashSet<string> AllowedPaymentMethods = new() { "COD", "VNPay", "Momo" };

    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ISettingsService _settingsService;

    public OrderService(
        IOrderRepository orderRepository,
        ICartRepository cartRepository,
        UserManager<ApplicationUser> userManager,
        ISettingsService settingsService)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _userManager = userManager;
        _settingsService = settingsService;
    }

    public async Task<List<OrderDto>> GetAllByUserDetailedAsync(string userId)
    {
        var orders = await _orderRepository.GetByUserDetailedAsync(userId);
        return orders.Select(ToDto).ToList();
    }

    public async Task<List<OrderDto>> GetAllDetailedAsync()
    {
        var orders = await _orderRepository.GetAllDetailedAsync();
        return orders.Select(ToDto).ToList();
    }

    public async Task<OrderDto> GetByIdDetailedAsync(int orderId)
    {
        var order = await _orderRepository.GetByIdDetailedAsync(orderId);
        if (order == null)
        {
            throw ApiException.BadRequest("Order not found!");
        }
        return ToDto(order);
    }

    public async Task<OrderDto> CreateAsync(CreateOrderDto dto)
    {
        var cart = await _cartRepository.GetByIdAsync(dto.CartId);
        if (cart == null)
        {
            throw ApiException.BadRequest("Cart not found!");
        }
        if (cart.Status == "Completed")
        {
            throw ApiException.BadRequest("Cart is already completed!");
        }

        var paymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "COD" : dto.PaymentMethod;
        if (!AllowedPaymentMethods.Contains(paymentMethod))
        {
            throw ApiException.BadRequest("Invalid payment method.");
        }
        var isQrPayment = paymentMethod is "VNPay" or "Momo";

        // Price is recomputed server-side from the cart's own server-maintained total
        // (never trust client-supplied Price/PriceInfo) since this amount now drives
        // a real gateway payment URL. Tax rate and shipping fee likewise come from the
        // server-side AppSettings row (admin-only to change), not constants or client input,
        // and the rate actually applied is snapshotted onto the order so it stays accurate
        // even if the admin changes the rate later.
        var settings = await _settingsService.GetAsync();
        var subtotal = cart.TotalPrice;
        var shipping = settings.ShippingFee;
        var taxRate = settings.TaxRate;
        var tax = Math.Round(subtotal * taxRate, 2);
        var total = subtotal + shipping + tax;

        var order = new Order
        {
            CartId = dto.CartId,
            UserId = dto.UserId,
            Price = total,
            PriceInfo = new PriceInfo
            {
                Subtotal = subtotal,
                Shipping = shipping,
                Tax = tax,
                TaxRate = taxRate,
                Total = total,
            },
            Customer = dto.Customer == null ? null : new OrderCustomer
            {
                FirstName = dto.Customer.FirstName,
                LastName = dto.Customer.LastName,
                Email = dto.Customer.Email,
                Phone = dto.Customer.Phone,
                Address = dto.Customer.Address,
            },
            Status = isQrPayment ? "PendingPayment" : "Shipped",
            PaymentMethod = paymentMethod,
            PaymentStatus = isQrPayment ? "Pending" : "NotApplicable",
            OrderDate = DateTime.UtcNow,
        };

        cart.Status = "Completed";

        await _orderRepository.AddAsync(order);
        await _orderRepository.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task<OrderDto> UpdatePaymentResultAsync(int orderId, bool success, string? gatewayTransactionId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw ApiException.BadRequest("Order not found!");
        }

        if (order.PaymentStatus != "Pending")
        {
            // Already finalized (Paid/Failed) — ignore duplicate/late gateway callbacks
            // so a stale or out-of-order delivery can't regress a Paid order.
            return ToDto(order);
        }

        order.PaymentStatus = success ? "Paid" : "Failed";
        if (success)
        {
            order.Status = "Shipped";
        }
        if (!string.IsNullOrEmpty(gatewayTransactionId))
        {
            order.GatewayTransactionId = gatewayTransactionId;
        }

        await _orderRepository.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task<OrderDto> UpdateAsync(int orderId, UpdateOrderDto dto)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw ApiException.BadRequest("Order not found!");
        }

        order.Price = dto.Price;
        if (dto.Customer != null)
        {
            order.Customer = new OrderCustomer
            {
                FirstName = dto.Customer.FirstName,
                LastName = dto.Customer.LastName,
                Email = dto.Customer.Email,
                Phone = dto.Customer.Phone,
                Address = dto.Customer.Address,
            };
        }

        await _orderRepository.SaveChangesAsync();
        return ToDto(order);
    }

    public async Task RemoveAsync(int orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw ApiException.BadRequest("Order not found!");
        }

        _orderRepository.Remove(order);
        await _orderRepository.SaveChangesAsync();
    }

    public async Task<List<OrderDto>> GetByUserFlatAsync(string userId)
    {
        var orders = await _orderRepository.GetByUserFlatAsync(userId);
        return orders.Select(ToDto).ToList();
    }

    private static OrderDto ToDto(Order order) => new()
    {
        Id = order.Id,
        CartId = order.CartId,
        UserId = order.UserId,
        Price = order.Price,
        PriceInfo = new PriceInfoDto
        {
            Subtotal = order.PriceInfo.Subtotal,
            Shipping = order.PriceInfo.Shipping,
            Tax = order.PriceInfo.Tax,
            TaxRate = order.PriceInfo.TaxRate,
            Total = order.PriceInfo.Total,
        },
        Customer = order.Customer == null ? null : new OrderCustomerDto
        {
            FirstName = order.Customer.FirstName,
            LastName = order.Customer.LastName,
            Email = order.Customer.Email,
            Phone = order.Customer.Phone,
            Address = order.Customer.Address,
        },
        Status = order.Status,
        PaymentMethod = order.PaymentMethod,
        PaymentStatus = order.PaymentStatus,
        GatewayTransactionId = order.GatewayTransactionId,
        OrderDate = order.OrderDate,
        User = order.User == null ? null : new UserDto
        {
            Id = order.User.Id,
            FirstName = order.User.FirstName,
            LastName = order.User.LastName,
            Email = order.User.Email!,
            Phone = order.User.PhoneNumber,
            Address = order.User.Address,
        },
        Cart = order.Cart == null ? null : new CartDto
        {
            Id = order.Cart.Id,
            UserId = order.Cart.UserId,
            TotalPrice = order.Cart.TotalPrice,
            Status = order.Cart.Status,
            Items = order.Cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name,
                Image = i.Product?.Image,
                Quantity = i.Quantity,
                Price = i.Price,
            }).ToList(),
        },
    };
}
