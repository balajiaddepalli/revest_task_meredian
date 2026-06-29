# Meridian Admin Portal

Standalone admin frontend for the Meridian commerce platform. This app is **separate** from the customer shop at `../frontend/` (port 3005).

## Purpose

- Admin-only access for managing products, orders, and users
- Runs on port **3006** in development and production containers
- Connects to the same API Gateway as the customer site (`VITE_API_URL`, default `http://localhost:3000`)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3006](http://localhost:3006).

Admin login requires an account with the `ADMIN` role (e.g. `admin@meridian.com` / `admin123` when seeded).

## Build & Docker

```bash
npm run build
docker build -t meridian-admin-frontend .
```

The container serves the SPA on port 3006 via nginx.

## Routes

| Path       | Description        |
| ---------- | ------------------ |
| `/login`   | Admin sign-in      |
| `/`        | Dashboard (stats)  |
| `/products`| Product management |
| `/orders`  | Order management   |
| `/users`   | User list          |

Non-admin users are rejected at login with **"Admin access only"**.
