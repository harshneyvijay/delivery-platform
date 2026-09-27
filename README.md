# Last-Mile Delivery Management Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing last-mile delivery orders, drivers, pricing, and order lifecycle tracking.

## Project Structure

```
last-mile-delivery/
├── backend/     Node.js + Express + MongoDB REST API
└── frontend/    React client
```
## Deployed at [https://delivery-platform-xi.vercel.app/]

## Features

- JWT + bcrypt authentication
- Role-based access control: ADMIN, DISPATCHER, DRIVER
- Order lifecycle management with server-side status transition validation
- Full order status history (who changed what, and when)
- Backend-authoritative delivery pricing calculation based on zone, weight, and COD
- Driver assignment
- Minimalist React UI wired to the real backend REST API

## Prerequisites

- Node.js (v18 or later recommended)
- npm
- A running MongoDB instance (local or a hosted service such as MongoDB Atlas)

## Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set:

   ```
   MONGO_URI=mongodb://localhost:27017/last-mile-delivery
   JWT_SECRET=your_own_long_random_secret
   PORT=5000
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000/api`. You can verify it is running by visiting `http://localhost:5000/api/health`.

## Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` if your backend runs on a different URL:

   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend:

   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`.

## Getting Started

1. Start MongoDB, then start the backend and frontend as described above.
2. Open `http://localhost:3000` in your browser.
3. Register a new account. On registration you choose a role (ADMIN, DISPATCHER, or DRIVER) — this is only for initial setup convenience; in a real deployment, user creation/role assignment should be restricted to ADMIN via the Users screen.
4. Log in as an ADMIN to:
   - Create pricing configurations for each delivery zone (required before orders can be created, since pricing is looked up by zone).
   - Manage users (create DISPATCHER and DRIVER accounts).
5. Log in as a DISPATCHER to create orders, assign drivers, and manage order status.
6. Log in as a DRIVER to view assigned orders and update delivery status.

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users (ADMIN only)
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Orders
- `POST /api/orders` (ADMIN, DISPATCHER)
- `GET /api/orders` (all roles; DRIVER sees only their assigned orders)
- `GET /api/orders/:id`
- `PUT /api/orders/:id` (ADMIN, DISPATCHER)
- `DELETE /api/orders/:id` (ADMIN)
- `PUT /api/orders/:id/assign` (ADMIN, DISPATCHER)
- `PUT /api/orders/:id/status` (all roles, subject to assignment/ownership checks)
- `GET /api/orders/:id/history`

### Pricing (ADMIN only for write operations)
- `GET /api/pricing`
- `POST /api/pricing`
- `PUT /api/pricing/:id`
- `DELETE /api/pricing/:id`

## Order Lifecycle

```
CREATED → ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

`CANCELLED` is allowed from any pre-delivery state (`CREATED`, `ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`).

Every status change is validated on the backend and recorded in the `OrderStatusHistory` collection, along with the authenticated user who made the change and a timestamp.

## Pricing Formula

```
Delivery Fee = Base Price for Zone + (Weight × Price Per Kg) + COD Fee
```

Pricing configuration is stored in MongoDB per zone. The delivery fee is always calculated on the backend when an order is created or when its zone/weight/COD fields are updated — the frontend never calculates or overrides pricing.

## Notes

- Passwords are hashed with bcrypt before being stored.
- All protected routes require a valid JWT sent as `Authorization: Bearer <token>`.
- Role-based authorization is enforced on the backend for every relevant route, independent of what the frontend displays.
