using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductService.Dal.Repositories;
using ProductService.Dal.Settings;

namespace ProductService.Dal.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddProductDal(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<MongoDbSettings>(
            configuration.GetSection("MongoDb"));

        services.AddSingleton<IProductRepository, ProductRepository>();

        return services;
    }
}
