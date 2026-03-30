using AuthService.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        var database = client.GetDatabase("EnterprisePlatform");
        _users = database.GetCollection<User>("Users");
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _users.Find(_ => true).ToListAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(User user)
    {
        await _users.InsertOneAsync(user);
    }

    public async Task UpdateAsync(string id, User user)
    {
        await _users.ReplaceOneAsync(u => u.Id == id, user);
    }

    public async Task DeleteAsync(string id)
    {
        await _users.DeleteOneAsync(u => u.Id == id);
    }
}
