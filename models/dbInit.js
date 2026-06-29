const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  const dbName = process.env.DB_NAME || 'ecommerce_db';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASS !== undefined ? process.env.DB_PASS : '';

  let tempConnection;
  try {
    console.log(`[DB SUCCESS] Connecting to MySQL server at ${dbHost} with user "${dbUser}" to verify database...`);
    tempConnection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPass
    });

    // 1. Create database if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`[DB SUCCESS] Database "${dbName}" checked/created.`);
  } catch (error) {
    console.error('[DB ERROR] Failed to connect to MySQL to verify database existence. Make sure XAMPP MySQL is active.');
    console.error(error);
    throw error;
  } finally {
    if (tempConnection) {
      await tempConnection.end();
    }
  }

  // Use the established database pool pool to run table creation
  const pool = require('../config/db');

  try {
    // 2. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user'
      ) ENGINE=InnoDB;
    `);
    console.log('[DB SUCCESS] "users" table verified.');

    // 3. Create Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB;
    `);
    console.log('[DB SUCCESS] "products" table verified.');

    // 4. Create Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('[DB SUCCESS] "orders" table verified.');

    // 5. Create Order Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('[DB SUCCESS] "order_items" table verified.');

    // 6. Seed Admin Account
    const adminUser = 'admin@store.com';
    const adminPass = 'admin123';
    const [existingAdmin] = await pool.query('SELECT * FROM users WHERE username = ?', [adminUser]);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
        adminUser,
        hashedPassword,
        'admin'
      ]);
      console.log(`[DB SEED] Admin account created successfully! Username: ${adminUser}, Password: ${adminPass}`);
    } else {
      console.log('[DB] Admin account already exists.');
    }

    // 7. Seed 4 clean dummy products if empty
    const [existingProducts] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
      const dummyProducts = [
        [
          'Apex Pro Mechanical Keyboard',
          'OmniPoint adjustable mechanical switches, OLED smart display, premium magnetic wrist rest, and per-key RGB customization.',
          199.99,
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600'
        ],
        [
          'MX Master 3S Wireless Mouse',
          'Ergonomic wireless mouse with ultra-fast scrolling, 8K DPI any-surface tracking, quiet clicks, and customizable gestures with multi-device support.',
          99.99,
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600'
        ],
        [
          'Sony WH-1000XM5 ANC Headphones',
          'Industry-leading active noise cancelling wireless over-ear headphones with auto NC optimizer, crystal clear hands-free calling, and 30-hour battery life.',
          349.99,
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
        ],
        [
          '49-Inch Odyssey G9 Curved Monitor',
          'Dual QHD gaming monitor with 1000R curvature, 240Hz refresh rate, 1ms response time, HDR1000, and NVIDIA G-SYNC compatibility for immersive workspaces.',
          1199.99,
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'
        ]
      ];

      for (const prod of dummyProducts) {
        await pool.query('INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)', prod);
      }
      console.log('[DB SEED] 4 dummy products populated successfully.');
    } else {
      console.log('[DB] Products table already contains data.');
    }

    console.log('[DB SUCCESS] Database schema initialization completed successfully.');
  } catch (error) {
    console.error('[DB ERROR] Database table creation or seeding failed.');
    console.error(error);
    throw error;
  }
}

module.exports = initDatabase;
