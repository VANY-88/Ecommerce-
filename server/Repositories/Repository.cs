using Microsoft.EntityFrameworkCore;
using WebShop.Api.Data;
using WebShop.Api.Repositories.Interfaces;

namespace WebShop.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<T> Set;

    public Repository(ApplicationDbContext context)
    {
        Context = context;
        Set = context.Set<T>();
    }

    public async Task<List<T>> GetAllAsync() => await Set.ToListAsync();

    public async Task<T?> GetByIdAsync(int id) => await Set.FindAsync(id);

    public async Task AddAsync(T entity) => await Set.AddAsync(entity);

    public void Update(T entity) => Set.Update(entity);

    public void Remove(T entity) => Set.Remove(entity);

    public Task SaveChangesAsync() => Context.SaveChangesAsync();
}
