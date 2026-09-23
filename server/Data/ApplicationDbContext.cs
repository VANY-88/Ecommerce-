using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebShop.Api.Models.Entities;

namespace WebShop.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentAttempt> PaymentAttempts => Set<PaymentAttempt>();
    public DbSet<AppSettings> AppSettings => Set<AppSettings>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Category>(entity =>
        {
            entity.HasQueryFilter(c => !c.IsDeleted);
            entity.Property(c => c.Name).IsRequired();
        });

        builder.Entity<Product>(entity =>
        {
            entity.HasQueryFilter(p => !p.IsDeleted);
            entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
            entity.Property(p => p.CostPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.DiscountPercent).HasColumnType("decimal(18,2)");
            entity.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Cart>(entity =>
        {
            entity.Property(c => c.TotalPrice).HasColumnType("decimal(18,2)");
            entity.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CartItem>(entity =>
        {
            entity.Property(ci => ci.Price).HasColumnType("decimal(18,2)");
            entity.HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ci => ci.Product)
                .WithMany()
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Price).HasColumnType("decimal(18,2)");
            entity.OwnsOne(o => o.PriceInfo, pi =>
            {
                pi.ToJson();
                pi.Property(p => p.Subtotal).HasPrecision(18, 2);
                pi.Property(p => p.Shipping).HasPrecision(18, 2);
                pi.Property(p => p.Tax).HasPrecision(18, 2);
                pi.Property(p => p.TaxRate).HasPrecision(18, 4);
                pi.Property(p => p.Total).HasPrecision(18, 2);
            });
            entity.OwnsOne(o => o.Customer, c =>
            {
                c.ToJson();
            });
            entity.HasOne(o => o.Cart)
                .WithMany()
                .HasForeignKey(o => o.CartId)
                .OnDelete(DeleteBehavior.Restrict);
            // One order per cart: a retried or concurrent checkout resumes the existing order.
            entity.HasIndex(o => o.CartId).IsUnique();
            entity.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(i => i.UnitCost).HasColumnType("decimal(18,2)");
            entity.Property(i => i.LineTotal).HasColumnType("decimal(18,2)");
            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PaymentAttempt>(entity =>
        {
            entity.Property(a => a.Method).HasMaxLength(20);
            entity.Property(a => a.TxnRef).HasMaxLength(50);
            entity.Property(a => a.Status).HasMaxLength(20);
            entity.Property(a => a.GatewayCreateDate).HasMaxLength(14);
            entity.HasIndex(a => a.TxnRef).IsUnique();
            // At most one open attempt per order, so two tabs / a double click can't
            // both hand out a payable gateway URL.
            entity.HasIndex(a => a.OrderId, "IX_PaymentAttempts_OrderId_Pending")
                .IsUnique()
                .HasFilter("\"Status\" = 'Pending'");
            entity.HasOne(a => a.Order)
                .WithMany(o => o.PaymentAttempts)
                .HasForeignKey(a => a.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AppSettings>(entity =>
        {
            entity.Property(s => s.TaxRate).HasColumnType("decimal(18,4)");
            entity.Property(s => s.ShippingFee).HasColumnType("decimal(18,2)");
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.TokenHash).IsUnique();
            entity.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
