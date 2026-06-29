const pool = require('../config/db');

const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.status(200).json(products);
  } catch (error) {
    console.error('[GET PRODUCTS ERROR]', error);
    res.status(500).json({ message: 'Internal server error while fetching products.' });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, image_url } = req.body;

  if (!name || !price || !image_url) {
    return res.status(400).json({ message: 'Name, price, and image URL are required.' });
  }

  // Basic number validation
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: 'Price must be a valid positive number.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)',
      [name, description || '', parsedPrice, image_url]
    );

    res.status(201).json({
      message: 'Product created successfully!',
      product: {
        id: result.insertId,
        name,
        description,
        price: parsedPrice,
        image_url
      }
    });
  } catch (error) {
    console.error('[CREATE PRODUCT ERROR]', error);
    res.status(500).json({ message: 'Internal server error while creating product.' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if product exists
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('[DELETE PRODUCT ERROR]', error);
    res.status(500).json({ message: 'Internal server error while deleting product.' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct
};
