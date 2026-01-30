import express from 'express';
import Product from '../models/Product.js';
import { getMockProducts, getMockProductById } from '../data/mockProducts.js';

const router = express.Router();

// Use mock data when MongoDB is not available
const useMockData = true; // Set to false when MongoDB is ready

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    if (useMockData) {
      // Use mock data
      const { 
        category, 
        type, 
        search, 
        featured, 
        page = 1, 
        limit = 12,
        sort
      } = req.query;

      const filters = {
        category: category !== 'all' ? category : undefined,
        type,
        search,
        featured: featured === 'true',
        page,
        limit,
        sortBy: sort
      };

      const result = getMockProducts(filters);
      
      return res.json({
        products: result.products,
        totalPages: result.pages,
        currentPage: result.page,
        total: result.total
      });
    }

    // Original MongoDB code
    const { 
      category, 
      type, 
      search, 
      featured, 
      page = 1, 
      limit = 12,
      sort = 'createdAt'
    } = req.query;

    const query = { active: true };
    
    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (featured === 'true') query.featured = true;
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sort === 'price-asc') sortOptions.price = 1;
    else if (sort === 'price-desc') sortOptions.price = -1;
    else if (sort === 'name') sortOptions.name = 1;
    else sortOptions.createdAt = -1;

    const products = await Product.find(query)
      .select('-fileUrl') // Don't expose file URLs to public
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    if (useMockData) {
      // Use mock data
      const product = getMockProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.json({ product });
    }

    // Original MongoDB code
    const product = await Product.findOne({ 
      _id: req.params.id, 
      active: true 
    }).select('-fileUrl');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get featured products (public)
router.get('/featured/list', async (req, res) => {
  try {
    if (useMockData) {
      // Use mock data
      const result = getMockProducts({ featured: true, limit: 6 });
      return res.json(result.products);
    }

    // Original MongoDB code
    const products = await Product.find({ 
      active: true, 
      featured: true 
    })
    .select('-fileUrl')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get product categories (public)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;