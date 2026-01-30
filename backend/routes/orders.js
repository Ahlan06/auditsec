import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('products.productId', 'name description')
      .select('-downloadTokens.token'); // Don't expose tokens

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by email (for customer support)
router.get('/customer/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 
      customerEmail: req.params.email.toLowerCase() 
    })
    .populate('products.productId', 'name description')
    .select('-downloadTokens.token')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;