import express from 'express';
import query from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST Create Order (Checkout)
router.post('/', verifyToken, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to place an order' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const product = query.get('SELECT * FROM products WHERE id = ?', [item.productId || item.id]);
      if (!product) {
        return res.status(400).json({ message: `Product ID ${item.productId || item.id} not found` });
      }

      const qty = parseInt(item.quantity) || 1;
      const itemTotal = product.price * qty;
      totalAmount += itemTotal;

      orderItemsToInsert.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty
      });

      // Update product inventory stock
      const newStock = Math.max(0, product.stock - qty);
      query.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, product.id]);
    }

    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const payMethod = paymentMethod || 'Credit Card';

    const orderResult = query.run(
      `INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, payment_method)
       VALUES (?, ?, ?, 'Placed', ?, ?)`,
      [orderNumber, req.user.id, totalAmount, shippingAddress, payMethod]
    );

    const orderId = orderResult.lastInsertRowid;

    for (const item of orderItemsToInsert) {
      query.run(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.price, item.quantity]
      );
    }

    const createdOrder = query.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    createdOrder.items = query.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// GET Current User's Orders
router.get('/user', verifyToken, (req, res) => {
  try {
    const orders = query.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    for (const order of orders) {
      order.items = query.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    res.json(orders);
  } catch (error) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ message: 'Error retrieving your orders' });
  }
});

// GET Single Order Tracking Details (User or Admin)
router.get('/:identifier', verifyToken, (req, res) => {
  try {
    const { identifier } = req.params;
    let order = null;

    if (identifier.startsWith('ORD-')) {
      order = query.get('SELECT * FROM orders WHERE order_number = ?', [identifier]);
    } else {
      order = query.get('SELECT * FROM orders WHERE id = ?', [identifier]);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this order' });
    }

    order.items = query.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.user = query.get('SELECT id, name, email FROM users WHERE id = ?', [order.user_id]);

    res.json(order);
  } catch (error) {
    console.error('Fetch order tracking error:', error);
    res.status(500).json({ message: 'Error retrieving order tracking details' });
  }
});

// GET All Orders (Admin only)
router.get('/', requireAdmin, (req, res) => {
  try {
    const orders = query.all('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of orders) {
      order.items = query.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.user = query.get('SELECT id, name, email FROM users WHERE id = ?', [order.user_id]);
    }
    res.json(orders);
  } catch (error) {
    console.error('Fetch all orders error:', error);
    res.status(500).json({ message: 'Error retrieving all orders' });
  }
});

// PUT Update Order Status (Admin only)
router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = query.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    query.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    const updatedOrder = query.get('SELECT * FROM orders WHERE id = ?', [id]);
    updatedOrder.items = query.all('SELECT * FROM order_items WHERE order_id = ?', [id]);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

export default router;
