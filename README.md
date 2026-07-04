# Revest Solutions - Senior Full Stack Developer Assignment

## Architecture

```
┌──────────────────┐  ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Customer Frontend│  │  Admin Frontend  │────▶│ API Gateway  │────▶│   Services   │
│ React + Vite     │  │  React + Vite    │     │  Nest.js     │     │  (TCP/RPC)   │
│  :3005           │  │  :3006           │     │  :3000       │     │              │
└──────────────────┘  └──────────────────┘     └──────┬───────┘     │ :3001 Product│
                                                       │             │ :3002 Order  │
                                                       │             │ :3003 User   │
                                                       │             │ :3004 Cart   │
                                                       │             └──────────────┘
                                                       │             ┌──────────────┐
                                                       └────────────▶│  PostgreSQL  │
                                                                     │   (shared)   │
                                                                     └──────────────┘
```

The **customer site** (`frontend/`) and **admin portal** (`admin-frontend/`) are separate Vite apps. Admin routes are not included in the customer app.

### Microservices

- **API Gateway** - Entry point, JWT auth, RBAC, route to services
- **Product Service** - Product CRUD, categories, stock validation (port 3001)
- **Order Service** - Order management, stock deduction (port 3002)
- **User Service** - Registration, login, JWT, roles (port 3003)
- **Cart Service** - Shopping cart, checkout orchestration (port 3004)

### Client Application

- **React 18** with **Vite** and **React Router** (pure React, no Next.js)
- **Material UI (MUI)** for responsive components
- **React Hook Form + Zod** for dynamic form validation
- **Dynamic Form** renders from `frontend/src/config/form-config.json` (TEXT/LIST/RADIO)
- **Auth context** + protected customer routes
- **Toast notifications** for user feedback

### Admin Portal (separate app)

- **Standalone repo folder:** `admin-frontend/` (port **3006**)
- Admin-only login (rejects non-ADMIN users)
- Dashboard stats, products CRUD, orders, users
- Not linked from the customer site

## Tech Stack

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| Nest.js         | Backend microservices framework |
| React 18 + Vite | Frontend SPA                    |
| React Router    | Client-side routing             |
| TypeScript      | Type safety                     |
| PostgreSQL 15   | Database                        |
| Prisma ORM      | Database access + migrations    |
| MUI             | UI component library            |
| React Hook Form | Form management                 |
| Zod             | Schema validation               |
| JWT + RBAC      | Authentication & authorization  |
| Playwright      | E2E testing                     |
| Docker          | Containerization                |

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Start Backend Services (one terminal each)

```bash
# User Service (port 3003)
cd backend/user-service && npm install && npx prisma db push && npm run start:dev

# Product Service (port 3001)
cd backend/product-service && npm install && npx prisma db push && npm run start:dev

# Order Service (port 3002)
cd backend/order-service && npm install && npx prisma db push && npm run start:dev

# Cart Service (port 3004)
cd backend/cart-service && npm install && npx prisma db push && npm run start:dev

# API Gateway (port 3000)
cd backend/api-gateway && npm install && npm run start:dev
```

### 3. Seed Demo Data

```bash
npm run backend:setup
```

This applies Prisma migrations and seeds demo data.
Admin: `admin@meridian.com` / `admin123`

### 4. Start Frontends (one terminal each)

```bash
cd frontend && npm install && npm run dev       # Customer app :3005
cd admin-frontend && npm install && npm run dev # Admin portal  :3006
```

### 5. Run E2E Tests

```bash
cd e2e && npm install && npx playwright test --grep-invert "Docker Compose|live-api-smoke"
```

## Docker (Full Stack)

```bash
docker compose up --build
```

## API Endpoints

Swagger docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

All routes are prefixed with `/api`. JWT bearer token required unless marked **Public**.

### Health (Public)

- `GET /api/health` — Service health check

### Auth (Public)

- `POST /api/auth/register` — Register (role: CUSTOMER; admin email gets ADMIN)
- `POST /api/auth/login` — Login, returns JWT

### Products (Public read)

- `GET /api/products` — List active products (`?search`, `?categoryId`, `?skip`, `?take`)
- `GET /api/products/:id` — Get product by ID
- `GET /api/categories` — List categories
- `GET /api/categories/:id` — Get category by ID

### Products (Admin only)

- `GET /api/admin/products` — List including archived (`?includeDeleted=true`)
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Soft delete (archive)
- `POST /api/products/:id/restore` — Restore archived product
- `POST /api/categories` — Create category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category

### Orders (Authenticated)

- `GET /api/orders/my-orders` — List authenticated user orders (aliases: `/api/orders/me`, `/api/orders/my`)
- `GET /api/orders/:id` — Get order by ID
- `GET /api/orders/:id/items` — List order line items (alias: `/api/orders/:id/products`)
- `PATCH /api/orders/:id/status` — Update order status (alias: `PUT /api/orders/:id`)
- `POST /api/orders/:id/cancel` — Cancel a pending order
- `PUT /api/orders/:id` — Update order status (deprecated alias)
- `GET /api/orders` — List all orders (admin)
- `POST /api/orders` — Create order (admin)
- `DELETE /api/orders/:id` — Delete order (admin)

### Cart (Authenticated — current user)

- `GET /api/cart` — Get my cart
- `POST /api/cart/items` — Add product to cart
- `PATCH /api/cart/items` — Update item quantity (body: `productId`, `quantity`)
- `DELETE /api/cart/items?productId=` — Remove product from cart
- `DELETE /api/cart/items/clear` — Clear all cart items
- `POST /api/cart/checkout` — Checkout and place order

Legacy aliases (`/api/cart/me/*`, `/api/cart/:userId/*`) remain for backward compatibility.

### Users (Authenticated)

- `GET /api/users/profile` — Get my profile
- `PUT /api/users/profile` — Update my profile
- `GET /api/users/:id` — Get user by ID (admin or self)
- `PUT /api/users/:id` — Update user by ID (admin or self)
- `GET /api/users` — List all users (admin)

## Dynamic Form JSON Config

Edit `frontend/src/config/form-config.json` — changing `fieldType` automatically changes the rendered MUI component:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Full Name",
      "fieldType": "TEXT",
      "required": true
    },
    {
      "id": 2,
      "name": "Email",
      "fieldType": "TEXT",
      "inputType": "email",
      "required": true
    },
    {
      "id": 3,
      "name": "Password",
      "fieldType": "TEXT",
      "inputType": "password",
      "minLength": 6,
      "required": true
    }
  ]
}
```

- `fieldType: "TEXT"` → MUI TextField (supports `inputType`: email, password)
- `fieldType: "LIST"` → MUI Select dropdown (stores label values)
- `fieldType: "RADIO"` → MUI RadioGroup

## Roles

| Role         | Access                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| **CUSTOMER** | Shop, cart, checkout, my orders, profile (customer site only)             |
| **ADMIN**    | Admin portal only: products CRUD, all orders, users list, dashboard stats |

Admin account is created when registering with `admin@meridian.com` (or via seed script).
