using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
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

        services.AddSingleton<IMongoClient>(sp => 
        {
            var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
            return new MongoClient(settings.ConnectionString);
        });

        services.AddSingleton<IProductRepository, ProductRepository>();

        return services;
    }
}
