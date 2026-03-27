using ProductService.Dal.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProductDal(builder.Configuration);

var app = builder.Build();

app.MapControllers();
app.MapGet("/health", () => "OK");

app.Run();
