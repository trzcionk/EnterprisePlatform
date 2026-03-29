FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["src/ProductService.Dal/ProductService.Dal.csproj", "ProductService.Dal/"]
COPY ["src/ProductService/ProductService.csproj", "ProductService/"]
RUN dotnet restore "ProductService/ProductService.csproj"

# Copy the remaining source code
COPY src/ProductService.Dal/ ProductService.Dal/
COPY src/ProductService/ ProductService/

WORKDIR /src/ProductService
RUN dotnet publish "ProductService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ProductService.dll"]