namespace AuthService.Dtos;

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
public record UserResponseDto(string Id, string Username, string Email, string Token);
