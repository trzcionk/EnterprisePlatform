using Moq;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using ProductService.Dal.Models;
using ProductService.Dal.Repositories;
using ProductService.Dal.Settings;
using Xunit;

namespace ProductService.Dal.Tests.Repositories;

public class ProductRepositoryTests
{
    private readonly Mock<IMongoCollection<Product>> _mockCollection;
    private readonly Mock<IMongoDatabase> _mockDatabase;
    private readonly Mock<IMongoClient> _mockClient;
    private readonly Mock<IOptions<MongoDbSettings>> _mockOptions;
    private readonly ProductRepository _repository;

    public ProductRepositoryTests()
    {
        _mockCollection = new Mock<IMongoCollection<Product>>();
        
        // Mock Indexes creation
        var mockIndexManager = new Mock<IMongoIndexManager<Product>>();
        _mockCollection.Setup(c => c.Indexes).Returns(mockIndexManager.Object);

        _mockDatabase = new Mock<IMongoDatabase>();
        _mockDatabase.Setup(d => d.GetCollection<Product>(It.IsAny<string>(), null))
            .Returns(_mockCollection.Object);

        _mockClient = new Mock<IMongoClient>();
        _mockClient.Setup(c => c.GetDatabase(It.IsAny<string>(), null))
            .Returns(_mockDatabase.Object);

        _mockOptions = new Mock<IOptions<MongoDbSettings>>();
        _mockOptions.Setup(o => o.Value).Returns(new MongoDbSettings
        {
            DatabaseName = "TestDB",
            CollectionName = "Products",
            ConnectionString = "mongodb://localhost"
        });

        _repository = new ProductRepository(_mockClient.Object, _mockOptions.Object);
    }

    [Fact]
    public async Task CreateAsync_SetsTimestampsAndInsertsProduct()
    {
        // Arrange
        var product = new Product
        {
            Name = "Test Product",
            Price = 10,
            Stock = 5,
            Category = "Test Category"
        };
        
        var before = DateTime.UtcNow;

        // Act
        var result = await _repository.CreateAsync(product);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.CreatedAt >= before);
        Assert.True(result.UpdatedAt >= before);
        _mockCollection.Verify(c => c.InsertOneAsync(product, null, default), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtAndReplacesProduct()
    {
        // Arrange
        var id = "some-id";
        var product = new Product
        {
            Id = id,
            Name = "Updated Product"
        };

        var before = DateTime.UtcNow;

        // Act
        await _repository.UpdateAsync(id, product);

        // Assert
        Assert.True(product.UpdatedAt >= before);
        
        _mockCollection.Verify(c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Product>>(), 
                product, 
                It.IsAny<ReplaceOptions>(), 
                default), 
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_DeletesProduct()
    {
        // Arrange
        var id = "some-id";

        // Act
        await _repository.DeleteAsync(id);

        // Assert
        _mockCollection.Verify(c => c.DeleteOneAsync(
                It.IsAny<FilterDefinition<Product>>(), 
                default), 
            Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllProducts()
    {
        // Arrange
        var products = new List<Product> 
        { 
            new Product { Name = "P1" }, 
            new Product { Name = "P2" } 
        };

        var mockCursor = new Mock<IAsyncCursor<Product>>();
        mockCursor.Setup(_ => _.Current).Returns(products);
        mockCursor
            .SetupSequence(_ => _.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        _mockCollection.Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Product>>(),
                It.IsAny<FindOptions<Product, Product>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, p => p.Name == "P1");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsProductIfExists()
    {
        // Arrange
        var id = "existing-id";
        var product = new Product { Id = id, Name = "Found Product" };
        var products = new List<Product> { product };

        var mockCursor = new Mock<IAsyncCursor<Product>>();
        mockCursor.Setup(_ => _.Current).Returns(products);
        mockCursor
            .SetupSequence(_ => _.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        _mockCollection.Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Product>>(),
                It.IsAny<FindOptions<Product, Product>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        // Act
        var result = await _repository.GetByIdAsync(id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
    }

    [Fact]
    public async Task GetByCategoryAsync_ReturnsFilteredProducts()
    {
        // Arrange
        var category = "Electronics";
        var products = new List<Product> 
        { 
            new Product { Category = category, Name = "Laptop" } 
        };

        var mockCursor = new Mock<IAsyncCursor<Product>>();
        mockCursor.Setup(_ => _.Current).Returns(products);
        mockCursor
            .SetupSequence(_ => _.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        _mockCollection.Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Product>>(),
                It.IsAny<FindOptions<Product, Product>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        // Act
        var result = await _repository.GetByCategoryAsync(category);

        // Assert
        Assert.Single(result);
        Assert.Equal("Laptop", result.First().Name);
    }
}
