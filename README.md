# Modern E-Commerce Web Application

A full-stack E-Commerce online store application built with **React (Vite)**, **Node.js / Express**, and **SQLite**. Includes product catalog management, shopping cart, checkout, order tracking, JWT role-based access control (Admin & User), and RESTful APIs.

---

## ✨ Features

- **🛍️ Product Catalog**: Interactive product browsing with search, category filters, and sorting.
- **🛒 Shopping Cart & Checkout**: Live cart drawer with quantity adjustments, subtotal breakdown, and checkout workflow.
- **📦 Order Tracking**: Real-time visual timeline tracker for customer orders (`Placed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`).
- **🔐 User & Admin Authentication**: JWT authentication with role-based access control.
- **👑 Admin Dashboard**: Full product CRUD operations (add, edit, delete) & order status management.
- **💾 SQLite Database**: Self-contained persistent database with seed data for products, users, and orders.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Modern Vanilla CSS with dark mode glassmorphism design.
- **Backend**: Node.js, Express.js, SQLite (`better-sqlite3`), JSON Web Tokens (JWT), bcryptjs.

---

## 🚀 Getting Started

### 1. Install Backend Dependencies & Start Server
```bash
cd server
npm install
npm run dev
```
The server runs on **http://localhost:5000**.

### 2. Install Frontend Dependencies & Start Client
```bash
cd client
npm install
npm run dev
```
The application will open on **http://localhost:5173**.

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **User** | `user@example.com` | `password123` |
| **Admin** | `admin@example.com` | `admin123` |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - User/Admin authentication
- `GET /api/auth/me` - Get current session details

### Products
- `GET /api/products` - List products (supports `search`, `category`, `sort`)
- `GET /api/products/:id` - Fetch single product details
- `POST /api/products` - Add product (Admin only)
- `PUT /api/products/:id` - Edit product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/user` - Fetch user orders
- `GET /api/orders/:id` - Fetch order tracking status
- `GET /api/orders` - Fetch all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

---

## 🐙 Git Repository

To push to your remote Git host (GitHub/GitLab):
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```
