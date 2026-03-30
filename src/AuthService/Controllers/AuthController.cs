using AuthService.Dtos;
using AuthService.Models;
using System.Threading.Tasks;
using AuthService.Repositories;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _repo;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _config;

    public AuthController(IUserRepository repo, ILogger<AuthController> logger, IConfiguration config)
    {
        _repo = repo;
        _logger = logger;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        _logger.LogInformation("Attempting to register user with email {Email}", dto.Email);
        
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing is null)
        {
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _repo.CreateAsync(user);
            _logger.LogInformation("Successfully registered user {Email}", dto.Email);
            var token = GenerateJwtToken(user);
            return Ok(new UserResponseDto(user.Id!, user.Username, user.Email, token));
        }
        
        _logger.LogWarning("Email {Email} is already registered", dto.Email);
        return BadRequest("Email is already registered");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        _logger.LogInformation("Attempting login for email {Email}", dto.Email);
        
        var user = await _repo.GetByEmailAsync(dto.Email);
        if (user is not null && BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _logger.LogInformation("Successfully logged in user {Email}", dto.Email);
            var token = GenerateJwtToken(user);
            return Ok(new UserResponseDto(user.Id!, user.Username, user.Email, token));
        }

        _logger.LogWarning("Invalid login attempt for email {Email}", dto.Email);
        return Unauthorized("Invalid credentials");
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id!)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:ExpiryInMinutes"]));

        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"],
            _config["Jwt:Audience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
