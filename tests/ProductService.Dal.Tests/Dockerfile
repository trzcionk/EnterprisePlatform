FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore as distinct layers
COPY ["src/ProductService.Dal/ProductService.Dal.csproj", "src/ProductService.Dal/"]
COPY ["tests/ProductService.Dal.Tests/ProductService.Dal.Tests.csproj", "tests/ProductService.Dal.Tests/"]
RUN dotnet restore "tests/ProductService.Dal.Tests/ProductService.Dal.Tests.csproj"

# Copy the remaining source code
COPY src/ProductService.Dal/ src/ProductService.Dal/
COPY tests/ProductService.Dal.Tests/ tests/ProductService.Dal.Tests/

# Change to the test directory and build
WORKDIR "/src/tests/ProductService.Dal.Tests"
RUN dotnet build "ProductService.Dal.Tests.csproj" -c Release --no-restore

# Provide an entry point to seamlessly run tests from the container
CMD ["dotnet", "test", "ProductService.Dal.Tests.csproj", "-c", "Release", "--no-build", "--logger:trx"]
