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
    private readonly IOrderRepository _orderRepository;
    private readonly ICartRepository _cartRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, UserManager<ApplicationUser> userManager)
    {
        _orderRepository = orderRepository;
        _cartRepository = cartRepository;
        _userManager = userManager;
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

        var order = new Order
        {
            CartId = dto.CartId,
            UserId = dto.UserId,
            Price = dto.Price,
            PriceInfo = new PriceInfo
            {
                Subtotal = dto.PriceInfo.Subtotal,
                Shipping = dto.PriceInfo.Shipping,
                Tax = dto.PriceInfo.Tax,
                Total = dto.PriceInfo.Total,
            },
            Customer = dto.Customer == null ? null : new OrderCustomer
            {
                FirstName = dto.Customer.FirstName,
                LastName = dto.Customer.LastName,
                Email = dto.Customer.Email,
                Phone = dto.Customer.Phone,
                Address = dto.Customer.Address,
            },
            Status = "Shipped",
            OrderDate = DateTime.UtcNow,
        };

        cart.Status = "Completed";

        await _orderRepository.AddAsync(order);
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
