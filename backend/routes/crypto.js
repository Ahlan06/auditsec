import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { generateDownloadTokens, sendOrderConfirmationEmail } from '../utils/orderUtils.js';

const router = express.Router();

// Crypto payment addresses (à configurer selon votre wallet)
const CRYPTO_ADDRESSES = {
  bitcoin: process.env.BITCOIN_ADDRESS || 'bc1q...',
  ethereum: process.env.ETHEREUM_ADDRESS || '0x...',
  litecoin: process.env.LITECOIN_ADDRESS || 'ltc1q...'
};

// Create crypto payment request
router.post('/create-crypto-payment', async (req, res) => {
  try {
    const { items, customerEmail, cryptoCurrency } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    if (!['bitcoin', 'ethereum', 'litecoin'].includes(cryptoCurrency)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency' });
    }

    // Validate products
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      active: true 
    });

    if (products.length !== items.length) {
      return res.status(400).json({ error: 'Some products are invalid or unavailable' });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const product = products.find(p => p._id.toString() === item.productId);
      return sum + (product.price * (item.quantity || 1));
    }, 0);

    // Generate unique order ID
    const orderId = `ZD-CRYPTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get crypto exchange rate (simulation - vous devriez utiliser une vraie API)
    const cryptoAmount = await convertToCrypto(totalAmount, cryptoCurrency);

    // Create crypto payment reference
    const paymentReference = crypto.randomBytes(16).toString('hex');

    // Create order
    const orderProducts = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity || 1
      };
    });

    const order = new Order({
      orderId,
      customerEmail: customerEmail || '',
      products: orderProducts,
      totalAmount,
      currency: 'eur',
      status: 'pending',
      paymentMethod: cryptoCurrency,
      cryptoPaymentData: {
        currency: cryptoCurrency,
        amount: cryptoAmount,
        address: CRYPTO_ADDRESSES[cryptoCurrency],
        reference: paymentReference,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await order.save();

    res.json({
      orderId,
      paymentAddress: CRYPTO_ADDRESSES[cryptoCurrency],
      amount: cryptoAmount,
      currency: cryptoCurrency,
      reference: paymentReference,
      expiresAt: order.cryptoPaymentData.expiresAt,
      qrCodeUrl: generateCryptoQRCode(CRYPTO_ADDRESSES[cryptoCurrency], cryptoAmount)
    });

  } catch (error) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ error: 'Failed to create crypto payment' });
  }
});

// Check crypto payment status
router.get('/crypto-payment-status/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.orderId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Manual crypto payment confirmation (pour l'admin ou webhook)
router.post('/confirm-crypto-payment', async (req, res) => {
  try {
    const { orderId, transactionHash } = req.body;

    const order = await Order.findOne({ orderId })
      .populate('products.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ error: 'Order already completed' });
    }

    // Update order
    order.status = 'completed';
    order.cryptoPaymentData.transactionHash = transactionHash;
    order.cryptoPaymentData.confirmedAt = new Date();

    // Generate download tokens
    order.downloadTokens = await generateDownloadTokens(order.products);

    await order.save();

    // Send confirmation email
    await sendOrderConfirmationEmail(order);

    console.log(`✅ Crypto payment confirmed for order ${order.orderId}`);

    res.json({
      success: true,
      orderId: order.orderId,
      status: order.status
    });

  } catch (error) {
    console.error('Error confirming crypto payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Convert EUR to crypto (simulation - utiliser une vraie API comme CoinGecko)
async function convertToCrypto(amountEUR, cryptoCurrency) {
  // Taux de change simulés (à remplacer par une vraie API)
  const exchangeRates = {
    bitcoin: 0.000025,    // ~40,000 EUR/BTC
    ethereum: 0.0005,     // ~2,000 EUR/ETH
    litecoin: 0.015       // ~66 EUR/LTC
  };

  const rate = exchangeRates[cryptoCurrency] || 0.000025;
  return (amountEUR * rate).toFixed(8);
}

// Generate QR code URL for crypto payment
function generateCryptoQRCode(address, amount) {
  // Utiliser un service de génération de QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${address}`;
}

export default router;
