import express from 'express';
import query from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all products with filtering & search
router.get('/', (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND featured = 1';
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      sql += ' ORDER BY rating DESC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const products = query.all(sql, params);
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

// GET categories list
router.get('/categories', (req, res) => {
  try {
    const categories = query.all('SELECT DISTINCT category FROM products ORDER BY category ASC');
    const categoryList = ['All', ...categories.map(c => c.category)];
    res.json(categoryList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});

// GET product by ID
router.get('/:id', (req, res) => {
  try {
    const product = query.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product details' });
  }
});

// POST Create product (Admin only)
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, description, price, category, image, stock, featured } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    const imgUrl = image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
    const isFeatured = featured ? 1 : 0;
    const stockVal = stock !== undefined ? parseInt(stock) : 10;

    const result = query.run(
      `INSERT INTO products (name, description, price, category, image, stock, featured, rating, reviews_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 4.5, 1)`,
      [name, description, parseFloat(price), category, imgUrl, stockVal, isFeatured]
    );

    const newProduct = query.get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// PUT Update product (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = query.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, image, stock, featured } = req.body;

    query.run(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, image = ?, stock = ?, featured = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : existing.name,
        description !== undefined ? description : existing.description,
        price !== undefined ? parseFloat(price) : existing.price,
        category !== undefined ? category : existing.category,
        image !== undefined ? image : existing.image,
        stock !== undefined ? parseInt(stock) : existing.stock,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        id
      ]
    );

    const updatedProduct = query.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = query.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    query.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
