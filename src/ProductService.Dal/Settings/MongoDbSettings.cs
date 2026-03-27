namespace ProductService.Dal.Settings;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "ProductsDb";
    public string CollectionName { get; set; } = "Products";
}
