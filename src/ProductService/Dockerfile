FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["src/ProductService.Dal/ProductService.Dal.csproj", "ProductService.Dal/"]
COPY ["src/ProductService/ProductService.csproj", "ProductService/"]
COPY ["tests/ProductService.Dal.Tests/ProductService.Dal.Tests.csproj", "ProductService.Dal.Tests/"]
RUN dotnet restore "ProductService/ProductService.csproj"
RUN dotnet restore "ProductService.Dal.Tests/ProductService.Dal.Tests.csproj"

# Copy the remaining source code
COPY src/ProductService.Dal/ ProductService.Dal/
COPY src/ProductService/ ProductService/
COPY tests/ProductService.Dal.Tests/ ProductService.Dal.Tests/

# Run tests
RUN dotnet test "ProductService.Dal.Tests/ProductService.Dal.Tests.csproj"

WORKDIR /src/ProductService
RUN dotnet publish "ProductService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ProductService.dll"]