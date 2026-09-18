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
- Entity Framework Core 10 + PostgreSQL (Npgsql)
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
- PostgreSQL (local instance or container), e.g. `docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine`

### Backend setup
```bash
cd server
cp appsettings.Development.json.example appsettings.Development.json
```
Edit `appsettings.Development.json` and set:
- `ConnectionStrings:DefaultConnection` to your PostgreSQL connection string
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

## Deploying to Render

The repo includes a [`render.yaml`](render.yaml) Blueprint that provisions two resources: the API as a Dockerized web service, and the client as a static site. The database is **not** hosted on Render — it points to a free [Neon](https://neon.tech) Postgres project instead, since Render's own free Postgres tier gets deleted after 30 days and Neon's doesn't.

1. Create a free project at [neon.tech](https://neon.tech). From the dashboard, copy the **pooled connection string** (hostname contains `-pooler`) — it looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`.
2. Push this repo to GitHub (Render deploys from a Git repo).
3. In the Render dashboard: **New > Blueprint**, pick the repo. Render reads `render.yaml` and shows the two resources to create.
4. Before applying, check the two placeholder URLs in `render.yaml` (`Cors__AllowedOrigins__0` and `REACT_APP_API_URL`) — they assume the service names `furnitech-api` / `furnitech-client` are available, which give you `https://furnitech-api.onrender.com` / `https://furnitech-client.onrender.com`. If Render appends a random suffix instead (name already taken), update both values to match and redeploy.
5. Render will prompt you for these `sync: false` secrets during setup (marked as such in the blueprint so they never live in git) — paste the real values in:
   - `ConnectionStrings__DefaultConnection` — the Neon connection string from step 1
   - `R2__AccountId`, `R2__AccessKeyId`, `R2__SecretAccessKey` — Cloudflare R2 credentials (product image storage)
   - `VnPay__TmnCode`, `VnPay__HashSecret` — VNPay merchant credentials
   - `Momo__PartnerCode`, `Momo__AccessKey`, `Momo__SecretKey` — Momo merchant credentials
6. Apply the blueprint. Render builds the API (which runs EF Core migrations and seeds demo data against Neon automatically on startup — see `Program.cs`), then the static site.
7. Rotate the Admin account's password (see [Demo Accounts](#demo-accounts) below) and the VNPay/Momo sandbox keys before treating this as a real production deployment.

**Known limitations of this setup:**
- Render's free web service spins down after 15 minutes of inactivity; the first request after that takes a few seconds to cold-start. (The Neon DB and the static site don't have this problem.)
- Neon's free branch auto-suspends when idle, but wakes on the next connection in about a second — no manual recreation needed, unlike Render's free Postgres.

## Demo Accounts

Seeded automatically on first run — **for local development only**. Change or remove these before any production deployment.

| Role  | Email                  | Password   |
|-------|-------------------------|------------|
| Admin | admin@furnitech.com     | *Randomly generated on first run — printed once to the server logs (`docker logs`, or Render's log stream) and never shown again. Save it then, or reset it via the database if lost.* |
| User  | user@furnitech.com      | User@123   |
