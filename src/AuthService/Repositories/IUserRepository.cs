using AuthService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AuthService.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(string id);
    Task CreateAsync(User user);
    Task UpdateAsync(string id, User user);
    Task DeleteAsync(string id);
}
