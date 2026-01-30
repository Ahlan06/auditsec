import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { generatePresignedUrl } from '../utils/s3Utils.js';

const router = express.Router();

// Download product using token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find order with this download token
    const order = await Order.findOne({
      'downloadTokens.token': token,
      'downloadTokens.used': false,
      'downloadTokens.expiresAt': { $gt: new Date() }
    }).populate('downloadTokens.productId');

    if (!order) {
      return res.status(404).json({ 
        error: 'Invalid or expired download link' 
      });
    }

    // Find the specific token
    const downloadToken = order.downloadTokens.find(dt => dt.token === token);
    if (!downloadToken) {
      return res.status(404).json({ 
        error: 'Download token not found' 
      });
    }

    const product = downloadToken.productId;
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }

    // Generate presigned URL for S3 download
    try {
      const downloadUrl = await generatePresignedUrl(product.fileUrl);
      
      // Mark token as used
      downloadToken.used = true;
      downloadToken.usedAt = new Date();
      await order.save();

      // Increment download count
      await Product.findByIdAndUpdate(product._id, {
        $inc: { downloadCount: 1 }
      });

      // Return download URL or redirect
      if (req.query.redirect === 'true') {
        res.redirect(downloadUrl);
      } else {
        res.json({
          downloadUrl,
          productName: product.name,
          expiresIn: '1 hour'
        });
      }

      console.log(`📥 Download: ${product.name} by ${order.customerEmail}`);
    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ 
        error: 'Failed to generate download link' 
      });
    }
  } catch (error) {
    console.error('Error processing download:', error);
    res.status(500).json({ 
      error: 'Download failed' 
    });
  }
});

// Get download status for an order
router.get('/status/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('downloadTokens.productId', 'name')
      .select('downloadTokens orderId status');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const downloads = order.downloadTokens.map(token => ({
      productId: token.productId._id,
      productName: token.productId.name,
      used: token.used,
      usedAt: token.usedAt,
      expiresAt: token.expiresAt,
      expired: token.expiresAt < new Date()
    }));

    res.json({
      orderId: order.orderId,
      status: order.status,
      downloads
    });
  } catch (error) {
    console.error('Error fetching download status:', error);
    res.status(500).json({ error: 'Failed to fetch download status' });
  }
});

export default router;