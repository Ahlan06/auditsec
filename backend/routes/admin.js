import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { 
  adminLogin, 
  verifyAdminSession, 
  adminLogout, 
  changeAdminPassword,
  verifyAdminToken 
} from '../middleware/adminAuth.js';

const router = express.Router();

// Route de connexion admin (publique)
router.post('/login', adminLogin);

// Vérification de session
router.get('/verify', verifyAdminToken, verifyAdminSession);

// Déconnexion
router.post('/logout', verifyAdminToken, adminLogout);

// Changement de mot de passe
router.post('/change-password', verifyAdminToken, changeAdminPassword);

// Route pour obtenir les informations admin (sans données sensibles)
router.get('/profile', verifyAdminToken, (req, res) => {
  res.json({
    username: req.admin.username,
    role: req.admin.role,
    loginTime: req.admin.loginTime
  });
});

// Apply admin authentication to all other routes
router.use(verifyAdminToken);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      completedOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      Product.countDocuments({ active: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'completed' }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.find()
        .populate('products.productId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderId customerEmail totalAmount status createdAt')
    ]);

    res.json({
      totalProducts,
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all products (admin view)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get all orders (admin view)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details (admin view)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching admin order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;