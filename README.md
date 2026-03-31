# EnterprisePlatform

EnterprisePlatform is a robust, enterprise-grade multi-service platform built with .NET and React. It demonstrates a microservices architecture with a centralized gateway, secure authentication, and scalable data processing.

## 🏗️ Architecture Overview

The platform consists of several independent microservices orchestrated with Docker:

*   **Gateway Service**: The single entry point for all client requests, routing traffic to relevant microservices.
*   **Auth Service**: Manages user registration, login, and JWT token issuance. It also provides a management interface for user accounts.
*   **Product Service**: Handles the core product inventory, allowing full CRUD operations on enterprise data.
*   **Data Processor Service**: Background worker service for processing data asynchronously.
*   **Frontend**: A modern React application built with Vite, Tailwind-inspired custom CSS, and Lucide icons.

## ✨ Key Features

- **🔐 Secure Authentication**: Full JWT-based authentication flow. Tokens are issued by the Auth Service and validated across microservices via standard `[Authorize]` attributes.
- **📦 Inventory Management**: Complete product lifecycle management including categories, pricing, and stock tracking.
- **👥 User Administration**: Integrated user management dashboard to list, edit, and remove user accounts.
- **🌍 Internationalization**: Full support for Multiple Languages (English & Polish) using `i18next`.
- **🖥️ Service Health Monitoring**: Real-time status indicators for all microservices directly in the dashboard.
- **🐳 Dockerized Infrastructure**: One-command deployment using Docker Compose, including a MongoDB database for persistence.

## 🛠️ Technology Stack

- **Backend**: .NET 10.0, ASP.NET Core, MongoDB Driver, BCrypt.Net, JWT.
- **Frontend**: React, Vite, Axios, i18next, Lucide React.
- **Infrastructure**: Docker, Docker Compose, MongoDB 7.0.

## 🚀 Getting Started

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

### 1. Run the Platform

From the root directory, run:

```bash
docker-compose up --build
```

### 2. Access the Application

- **Frontend**: http://localhost:5173
- **Gateway Service**: http://localhost:5003
- **Auth Service**: http://localhost:5001
- **Product Service**: http://localhost:5004

## 📖 Documentation

- [Professional Note](docs/PROFESSIONAL_NOTE.md) - Source code and sharing policies.
- See individual service directories for specific service documentation.
