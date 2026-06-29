# AeroTech E-Commerce Full-Stack Web Application

A complete, production-ready Full-Stack E-Commerce web application developed under strict internship guidelines. This project demonstrates high-performance engineering patterns using Vanilla JavaScript in the frontend, Node.js + Express.js on the backend, and MySQL (configured for XAMPP root with blank password).

---

## 📂 Project Directory Structure

```text
ecommerce-app/
├── README.md               # Technical setup instructions
├── frontend/
│   ├── index.html          # Product catalog grid with Add to Cart and Header controls
│   ├── auth.html           # Unified Register/Login page
│   ├── cart.html           # Cart checkout list, tax tallies, and order history ledger
│   ├── admin.html          # Admin panel for product CRUD & all customer orders
│   ├── style.css           # Premium dark mode theme stylesheets
│   └── app.js              # State manager and frontend API integrations
└── backend/
    ├── server.js           # Express system bootstrap server
    ├── .env                # Host, port, DB constants, and JWT secret keys
    ├── package.json        # Node dependency configurations
    ├── config/
    │   └── db.js           # MySQL2 connection pool setup
    ├── controllers/
    │   ├── authController.js   # JWT sessions login & registration logic
    │   ├── productController.js# Product CRUD (Protected for delete/post)
    │   └── orderController.js  # Order placement transactions & tracking
    ├── middleware/
    │   └── authMiddleware.js   # Role guarding checker (admin/user)
    └── models/
        └── dbInit.js       # Automatic DB creation, tables setup, and seeding
```

---

## 🛠️ Requirements & Setup Procedures

### 1. Database Setup (XAMPP MySQL)
1. Launch the **XAMPP Control Panel** on your computer.
2. Click **Start** for both **Apache** and **MySQL**.
3. Ensure MySQL is listening on its default port: `3306`.
4. *Note:* You do **not** need to create the database manually. The backend utilizes an auto-initialization script (`models/dbInit.js`) that will automatically run `CREATE DATABASE IF NOT EXISTS ecommerce_db;` and provision all required tables, admin account, and dummy seed items.

### 2. Backend Dependencies Installation
Open a terminal in the root directory and navigate to the backend folder:
```bash
cd ecommerce-app/backend
```
Install the package dependencies:
```bash
npm install
```

### 3. Environment Variables Configuration
Confirm the backend configurations match the `.env` settings located in `ecommerce-app/backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=ecommerce_db
JWT_SECRET=supersecretjwtkeyforecommerceapplication2026
JWT_EXPIRES_IN=7d
```

### 4. Running the Application
To run the server in development mode (using nodemon for hot-reloads):
```bash
npm run dev
```
To run the server in standard production mode:
```bash
npm start
```

Upon starting, you will see output like:
```text
[STARTUP] Starting database initialization...
[DB SUCCESS] Connecting to MySQL server at localhost with user "root" to verify database...
[DB SUCCESS] Database "ecommerce_db" checked/created.
[DB SUCCESS] "users" table verified.
[DB SUCCESS] "products" table verified.
[DB SUCCESS] "orders" table verified.
[DB SUCCESS] "order_items" table verified.
[DB SEED] Admin account created successfully! Username: admin@store.com, Password: admin123
[DB SEED] 4 dummy products populated successfully.
[DB SUCCESS] Database schema initialization completed successfully.
----------------------------------------------------
[SERVER SUCCESS] Running on http://localhost:5000
[FRONTEND LINK] Storefront accessible: http://localhost:5000/
[ADMIN LINK] Admin portal accessible: http://localhost:5000/admin.html
----------------------------------------------------
```

---

## 🔑 Demo Account Credentials

Use these accounts to evaluate features:
1. **Shopper Account (Standard User)**:
   - Click "Create Account" on the access portal (`auth.html`).
   - Register a username (e.g. `buyer1`) and password.
   - Or run tests with any credentials. Registered accounts automatically get the `user` role.
2. **Administrator Account (Store Owner)**:
   - **Username/Email**: `admin@store.com`
   - **Password**: `admin123`

---

## 🎯 Key Application Features & Workflows

### 1. Dynamic Catalog Storefront (`index.html`)
- Displays seeded products directly from the SQL database.
- Features CSS layouts with glassmorphism border card items, scale hover triggers, and dynamic add-to-cart badges.

### 2. Integrated Auth Control (`auth.html`)
- Supports sliding tabs to toggle between login and signup.
- Stores JWT token credentials inside browser's local cache (`localStorage.getItem('token')`).

### 3. Shopping Cart & Order Tracking (`cart.html`)
- Saves cart data clientside. Allows incrementing/decrementing item quantities or clearing listings.
- Completing "Proceed to Checkout" makes a transaction post to the backend `POST /api/orders` to store record IDs.
- Displays a beautiful order complete card when invoices are verified.
- Displays the user's order history grid at the bottom when logged in.

### 4. Administrative Dashboard Control (`admin.html`)
- Protects endpoints both client-side (app redirects) and backend-side (role-based middleware).
- Form inputs add catalog items.
- Listing table lets administrators delete files or items instantly.
- Order Audit log shows full user invoice receipts, purchase timestamp, names, and items catalog lists.

---

## 🛰️ REST API Documentation

### Authentication `/api/auth`
- `POST /register`: Accepts `{ username, password }` and registers a user (defaults to `role: 'user'`).
- `POST /login`: Accepts `{ username, password }` and returns `{ token, user: { id, username, role } }`.

### Catalog `/api/products`
- `GET /`: Lists all products in the database. (Public)
- `POST /`: Registers a product. (Admin only - Requires Bearer JWT header).
- `DELETE /:id`: Deletes product matching ID. (Admin only - Requires Bearer JWT header).

### Orders `/api/orders`
- `POST /`: Places a multiple-item purchase. (Shopper only - Requires Bearer JWT header).
- `GET /my-orders`: Returns purchase history for current session. (Shopper only - Requires Bearer JWT header).
- `GET /`: Lists all shop logs. (Admin only - Requires Bearer JWT header).
