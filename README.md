# Furnitech

A full-stack e-commerce storefront for furniture, with a customer shopping experience and a role-gated admin dashboard for inventory and sales management.

## Tech Stack

**Frontend** (`client/`)
- React 18 + TypeScript
- React Router v7
- Tailwind CSS
- Axios (HTTP client, with JWT bearer interceptor)
- Recharts (admin dashboard charts)
- jsPDF / jsPDF-autotable (report export)
- react-toastify (notifications)

**Backend** (`server/`)
- ASP.NET Core 10 Web API
- Entity Framework Core 10 + SQL Server
- ASP.NET Core Identity + JWT Bearer authentication
- Swashbuckle / Swagger (API docs)

## Features & Workflows

### Customer flow
1. Register or log in (`/signup`, `/login`)
2. Browse products on the landing page or product catalog (`/landing`, `/products`)
3. View product details (`/products/:productId`)
4. Add items to cart (`/cart`)
5. Enter shipping details (`/shipping`) and complete checkout (`/checkout`)
6. View order history and manage account (`/profile`, `/edit-profile`)

Also includes `/about` and `/blog` pages, plus a forgot/reset-password flow.

### Admin flow
Admins log in with an Admin-role account and access the role-gated dashboard at `/admin/dashboard`, with four sections:
- **Inventory** — create/edit/delete products, including image upload and an optional discount percentage with a start/end date range
- **Sold Items** — list of all sold line items across orders
- **Profit Stats** — monthly revenue/cost/profit breakdown
- **Best Sellers** — top-selling products by quantity and revenue

## Project Structure

- `client/` — the React + TypeScript single-page app
- `server/` — the ASP.NET Core Web API (EF Core, Identity/JWT auth, REST endpoints under `/api`)

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS)
- SQL Server (local instance or container)

### Backend setup
```bash
cd server
cp appsettings.Development.json.example appsettings.Development.json
```
Edit `appsettings.Development.json` and set:
- `ConnectionStrings:DefaultConnection` to your SQL Server connection string
- `Jwt:Secret` to a real random secret (at least 32 bytes)

Then run:
```bash
dotnet restore
dotnet run
```
Database migrations and seed data (roles, demo accounts, categories, products) are applied automatically on startup. The API runs at `http://localhost:5000` (Swagger UI available at the root in Development).

### Frontend setup
```bash
cd client
cp .env.example .env
npm install
npm start
```
The app runs at `http://localhost:3000` and talks to the API via `REACT_APP_API_URL` (set in `.env`).

## Demo Accounts

Seeded automatically on first run — **for local development only**. Change or remove these before any production deployment.

| Role  | Email                  | Password   |
|-------|-------------------------|------------|
| Admin | admin@furnitech.com     | Admin@123  |
| User  | user@furnitech.com      | User@123   |
