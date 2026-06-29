const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const initDatabase = require('./models/dbInit');
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const { authenticateJWT, requireAdmin, requireUser } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and request parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from ../frontend directory
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes

// 1. Auth REST Endpoints
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// 2. Product REST Endpoints
app.get('/api/products', productController.getAllProducts); // Public
app.post('/api/products', authenticateJWT, requireAdmin, productController.createProduct); // Admin only
app.delete('/api/products/:id', authenticateJWT, requireAdmin, productController.deleteProduct); // Admin only

// 3. Order REST Endpoints
app.post('/api/orders', authenticateJWT, requireUser, orderController.createOrder); // Shopper only
app.get('/api/orders/my-orders', authenticateJWT, requireUser, orderController.getMyOrders); // Shopper only
app.get('/api/orders', authenticateJWT, requireAdmin, orderController.getAllOrders); // Admin only

// Wildcard fallback to storefront index.html (optional but good for SPA/Routing fallback)
app.get('*', (req, res, next) => {
  // If requesting api, let it handle naturally
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(500).json({ message: 'A server error occurred. Please contact the administrator.' });
});

// Run DB Auto-Init, then start listening
console.log('[STARTUP] Starting database initialization...');
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(`[SERVER SUCCESS] Running on http://localhost:${PORT}`);
      console.log(`[FRONTEND LINK] Storefront accessible: http://localhost:${PORT}/`);
      console.log(`[ADMIN LINK] Admin portal accessible: http://localhost:${PORT}/admin.html`);
      console.log('----------------------------------------------------');
    });
  })
  .catch((err) => {
    console.error('[STARTUP ERROR] Database could not initialize. Server starting halted.');
    console.error(err);
    process.exit(1);
  });
