using AuthService.Dtos;
using AuthService.Models;
using AuthService.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AuthService.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repo;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserRepository repo, ILogger<UsersController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Fetching all users");
        var users = await _repo.GetAllAsync();
        var response = users.Select(u => new { 
            u.Id, 
            u.Username, 
            u.Email, 
            u.CreatedAt 
        });
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        _logger.LogInformation("Updating user {Id}", id);
        var user = await _repo.GetByIdAsync(id);
        if (user is null) return NotFound();

        user.Username = dto.Username;
        user.Email = dto.Email;

        await _repo.UpdateAsync(id, user);
        return Ok(new { user.Id, user.Username, user.Email });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterDto dto)
    {
        _logger.LogInformation("Creating new user with email {Email}", dto.Email);
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing is not null) return BadRequest("Email already exists");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = System.DateTime.UtcNow
        };

        await _repo.CreateAsync(user);
        return CreatedAtAction(nameof(GetAll), new { }, new { user.Id, user.Username, user.Email });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        _logger.LogInformation("Deleting user {Id}", id);
        var user = await _repo.GetByIdAsync(id);
        if (user is null) return NotFound();

        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
