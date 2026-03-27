namespace ProductService.Dtos;

public record CreateProductDto(
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string Category);

public record UpdateProductDto(
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string Category);
