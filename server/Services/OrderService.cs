using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WebShop.Api.Common;
using WebShop.Api.Data;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.DTOs.Orders;
using WebShop.Api.DTOs.Users;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ISettingsService _settingsService;
    private readonly ApplicationDbContext _db;

    public OrderService(
        IOrderRepository orderRepository,
        ICartRepository cartRepository,
        UserManager<ApplicationUser> userManager,
        ISettingsService settingsService,
        ApplicationDbContext db)
    {
        _db = db;
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
        var cart = await _cartRepository.GetByIdWithItemsAsync(dto.CartId);
        if (cart == null)
        {
            throw ApiException.BadRequest("Cart not found!");
        }
        if (cart.UserId != dto.UserId)
        {
            throw ApiException.Forbidden("You can only check out your own cart.");
        }
        if (cart.Status == "Completed")
        {
            // Back button / retry / second tab: resume the order already made from this cart.
            return await ResumeOrderAsync(dto);
        }

        var paymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? PaymentMethods.Cod : dto.PaymentMethod;
        if (!PaymentMethods.All.Contains(paymentMethod))
        {
            throw ApiException.BadRequest("Invalid payment method.");
        }
        var isGatewayPayment = PaymentMethods.IsGateway(paymentMethod);

        // Price is recomputed server-side from current product prices (discounts included),
        // never from client-supplied Price/PriceInfo or the cart's running total, since this
        // amount drives a real gateway payment. Items whose product was deleted are already
        // excluded by the Product query filter. Tax rate and shipping fee come from the
        // server-side AppSettings row, and the rate applied is snapshotted onto the order.
        var now = DateTime.UtcNow;
        var lines = cart.Items
            .Where(i => i.Product != null && i.Quantity > 0)
            .Select(i =>
            {
                var unitPrice = i.Product.EffectivePriceAt(now);
                return new OrderItem
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    Image = i.Product.Image,
                    UnitPrice = unitPrice,
                    UnitCost = i.Product.CostPrice,
                    Quantity = i.Quantity,
                    LineTotal = unitPrice * i.Quantity,
                };
            })
            .ToList();
        if (lines.Count == 0)
        {
            throw ApiException.BadRequest("Your cart is empty.");
        }

        var settings = await _settingsService.GetAsync();
        var subtotal = lines.Sum(l => l.LineTotal);
        var shipping = settings.ShippingFee;
        var taxRate = settings.TaxRate;
        // Half-up, matching how the client rounds the tax it displays.
        var tax = Math.Round(subtotal * taxRate, 2, MidpointRounding.AwayFromZero);
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
            Customer = ToCustomer(dto.Customer),
            Status = isGatewayPayment ? OrderStatuses.PendingPayment : OrderStatuses.Shipped,
            PaymentMethod = paymentMethod,
            PaymentStatus = isGatewayPayment ? PaymentStatuses.Pending : PaymentStatuses.NotApplicable,
            OrderDate = now,
            Items = lines,
        };

        try
        {
            await using var tx = await _db.Database.BeginTransactionAsync();

            // Close the cart atomically: only one request can move it out of Pending.
            var closed = await _db.Carts
                .Where(c => c.Id == cart.Id && c.Status == "Pending")
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Status, "Completed"));
            if (closed == 0)
            {
                await tx.RollbackAsync();
                _db.ChangeTracker.Clear();
                return await ResumeOrderAsync(dto);
            }

            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            _db.ChangeTracker.Clear();
            return await ResumeOrderAsync(dto);
        }

        return await GetByIdDetailedAsync(order.Id);
    }

    private async Task<OrderDto> ResumeOrderAsync(CreateOrderDto dto)
    {
        var existing = await _orderRepository.GetByCartIdAsync(dto.CartId);
        if (existing == null)
        {
            throw ApiException.BadRequest("Cart is already completed!");
        }
        if (existing.UserId != dto.UserId)
        {
            throw ApiException.Forbidden("You can only access your own orders.");
        }

        // The user may have gone back and edited the shipping details.
        if (dto.Customer != null && existing.PaymentStatus is PaymentStatuses.Pending or PaymentStatuses.Failed)
        {
            existing.Customer = ToCustomer(dto.Customer);
            await _orderRepository.SaveChangesAsync();
        }

        return await GetByIdDetailedAsync(existing.Id);
    }

    public async Task<OrderDto> UpdateAsync(int orderId, UpdateOrderDto dto)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw ApiException.BadRequest("Order not found!");
        }

        if (dto.Price != order.Price &&
            (order.PaymentStatus == PaymentStatuses.Paid || await _orderRepository.HasPaymentActivityAsync(orderId)))
        {
            // The price is what the gateway was (or is being) asked to charge.
            throw ApiException.BadRequest("The price can't be changed once a payment has been started or made.");
        }

        order.Price = dto.Price;
        if (dto.Customer != null)
        {
            order.Customer = ToCustomer(dto.Customer);
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

        if (order.PaymentStatus == PaymentStatuses.Paid || await _orderRepository.HasPaymentActivityAsync(orderId))
        {
            throw ApiException.BadRequest("Orders with payment activity can't be deleted.");
        }

        _orderRepository.Remove(order);
        await _orderRepository.SaveChangesAsync();
    }

    public async Task<List<OrderDto>> GetByUserFlatAsync(string userId)
    {
        var orders = await _orderRepository.GetByUserFlatAsync(userId);
        return orders.Select(ToDto).ToList();
    }

    private static OrderCustomer? ToCustomer(OrderCustomerDto? dto) => dto == null ? null : new OrderCustomer
    {
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        Email = dto.Email,
        Phone = dto.Phone,
        Address = dto.Address,
    };

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
        // Items come from the order's snapshot; kept in the CartDto shape the client already reads.
        Cart = new CartDto
        {
            Id = order.CartId,
            UserId = order.UserId,
            TotalPrice = order.PriceInfo.Subtotal,
            Status = "Completed",
            Items = order.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Image = i.Image,
                Quantity = i.Quantity,
                Price = i.LineTotal,
            }).ToList(),
        },
    };
}
