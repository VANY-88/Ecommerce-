using WebShop.Api.Common;
using WebShop.Api.DTOs.Carts;
using WebShop.Api.Models.Entities;
using WebShop.Api.Repositories.Interfaces;
using WebShop.Api.Services.Interfaces;

namespace WebShop.Api.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public CartService(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<CartDto> GetOrCreatePendingAsync(string userId)
    {
        var carts = await _cartRepository.GetAllByUserWithItemsAsync(userId);
        var pending = carts.FirstOrDefault(c => c.Status == "Pending");
        if (pending != null)
        {
            return ToDto(pending);
        }

        var newCart = new Cart
        {
            UserId = userId,
            TotalPrice = 0,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
        };

        await _cartRepository.AddAsync(newCart);
        await _cartRepository.SaveChangesAsync();
        return ToDto(newCart);
    }

    public async Task<CartDto> AddItemAsync(string userId, int productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
        {
            throw ApiException.BadRequest("Product not found!");
        }

        var cart = await _cartRepository.GetPendingByUserWithItemsAsync(userId);

        if (cart == null)
        {
            var newCart = new Cart
            {
                UserId = userId,
                TotalPrice = product.Price,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                Items = new List<CartItem>
                {
                    new() { ProductId = productId, Quantity = 1, Price = product.Price },
                },
            };

            await _cartRepository.AddAsync(newCart);
            await _cartRepository.SaveChangesAsync();
            return ToDto(newCart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            existingItem.Quantity += 1;
            existingItem.Price += product.Price;
        }
        else
        {
            cart.Items.Add(new CartItem { ProductId = productId, Quantity = 1, Price = product.Price });
        }

        cart.TotalPrice += product.Price;

        await _cartRepository.SaveChangesAsync();
        return ToDto(cart);
    }

    public async Task<CartDto> RemoveFromCartAsync(string userId, int productId)
    {
        var cart = await _cartRepository.GetPendingByUserWithItemsAsync(userId);
        if (cart == null)
        {
            throw ApiException.BadRequest("Cart is empty!");
        }

        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            cart.TotalPrice -= item.Price;
            cart.Items.Remove(item);
        }

        await _cartRepository.SaveChangesAsync();
        return ToDto(cart);
    }

    public async Task<CartDto> RemoveItemAsync(string userId, int itemId)
    {
        var cart = await _cartRepository.GetPendingByUserWithItemsAsync(userId);
        if (cart == null)
        {
            throw ApiException.BadRequest("Cart not found!");
        }

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
        {
            throw ApiException.BadRequest("Item not found in cart!");
        }

        cart.TotalPrice -= item.Price;
        cart.Items.Remove(item);

        await _cartRepository.SaveChangesAsync();
        return ToDto(cart);
    }

    public async Task<CartDto> ModifyCartAsync(string userId, int itemId, int quantity)
    {
        if (quantity <= 0)
        {
            throw ApiException.BadRequest("Quantity must be greater than zero");
        }

        var cart = await _cartRepository.GetPendingByUserWithItemsAsync(userId);
        if (cart == null)
        {
            throw ApiException.BadRequest("Cart not found!");
        }

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
        {
            throw ApiException.BadRequest("Item not found in cart!");
        }

        if (item.Product == null)
        {
            throw ApiException.BadRequest("Product information is missing or incomplete!");
        }

        cart.TotalPrice -= item.Price;
        item.Quantity = quantity;
        item.Price = item.Product.Price * quantity;
        cart.TotalPrice += item.Price;

        await _cartRepository.SaveChangesAsync();
        return ToDto(cart);
    }

    private static CartDto ToDto(Cart cart) => new()
    {
        Id = cart.Id,
        UserId = cart.UserId,
        TotalPrice = cart.TotalPrice,
        Status = cart.Status,
        Items = cart.Items.Select(i => new DTOs.Carts.CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name,
            Image = i.Product?.Image,
            Quantity = i.Quantity,
            Price = i.Price,
        }).ToList(),
    };
}
