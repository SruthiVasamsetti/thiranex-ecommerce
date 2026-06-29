const pool = require('../config/db');

const createOrder = async (req, res) => {
  const { items } = req.body; // Array of { product_id, quantity }
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart items are required to place an order.' });
  }

  const connection = await pool.getConnection();
  try {
    // Start Transaction
    await connection.beginTransaction();

    let calculatedTotal = 0;
    const validatedItems = [];

    // Verify products and calculate total
    for (const item of items) {
      const { product_id, quantity } = item;
      const parsedQty = parseInt(quantity, 10);

      if (!product_id || isNaN(parsedQty) || parsedQty <= 0) {
        throw new Error(`Invalid product ID or quantity: id ${product_id}, qty ${quantity}`);
      }

      // Fetch product detail to get fresh correct price
      const [rows] = await connection.query('SELECT price, name FROM products WHERE id = ?', [product_id]);
      if (rows.length === 0) {
        throw new Error(`Product not found with ID: ${product_id}`);
      }

      const product = rows[0];
      const itemPrice = parseFloat(product.price);
      calculatedTotal += itemPrice * parsedQty;

      validatedItems.push({
        product_id,
        quantity: parsedQty,
        price: itemPrice
      });
    }

    // 1. Insert into orders table
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, calculatedTotal, 'Pending']
    );
    const orderId = orderResult.insertId;

    // 2. Insert details into order_items table
    const insertItemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
    for (const validatedItem of validatedItems) {
      await connection.query(insertItemQuery, [
        orderId,
        validatedItem.product_id,
        validatedItem.quantity,
        validatedItem.price
      ]);
    }

    // Commit Transaction
    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      total_amount: calculatedTotal
    });
  } catch (error) {
    // Rollback dynamic queries on failure
    await connection.rollback();
    console.error('[ORDER TRANSACTION ERROR]', error);
    res.status(400).json({ message: error.message || 'Error occurred while processing the order.' });
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user's orders
    const [orders] = await pool.query(
      'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    // Fetch items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('[GET MY ORDERS ERROR]', error);
    res.status(500).json({ message: 'Internal server error while fetching orders.' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders with user details
    const [orders] = await pool.query(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, u.username 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC`
    );

    // Fetch items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('[GET ALL ORDERS ERROR]', error);
    res.status(500).json({ message: 'Internal server error while fetching all orders.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders
};
