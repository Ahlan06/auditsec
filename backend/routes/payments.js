import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { generateDownloadTokens, sendOrderConfirmationEmail } from '../utils/orderUtils.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    console.log('📦 Creating checkout session with items:', items);
    console.log('📧 Customer email:', customerEmail);

    // Use product data sent directly from frontend (no database needed)
    const lineItems = items.map(item => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name || 'Product',
            description: item.description || '',
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      };
    });

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const price = item.price || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);

    console.log('💰 Total amount:', totalAmount);

    // Generate unique order ID
    const orderId = `AS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('🎫 Generated order ID:', orderId);

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        customerEmail: customerEmail || '',
        items: JSON.stringify(items)
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    console.log('✅ Stripe session created:', session.id);

    // Note: Order will be saved in webhook after successful payment
    // For now, just return the session ID

    res.json({ sessionId: session.id, orderId });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe Webhook Handler
router.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;
      
      case 'checkout.session.expired':
        await handleExpiredSession(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
  try {
    const order = await Order.findOne({ stripeSessionId: session.id })
      .populate('products.productId');

    if (!order) {
      console.error('Order not found for session:', session.id);
      return;
    }

    // Update order status
    order.status = 'completed';
    order.stripePaymentIntentId = session.payment_intent;
    order.customerEmail = session.customer_email || order.customerEmail;
    order.customerName = session.customer_details?.name;

    // Generate download tokens
    order.downloadTokens = await generateDownloadTokens(order.products);

    await order.save();

    // Send confirmation email with download links
    await sendOrderConfirmationEmail(order);

    console.log(`✅ Order ${order.orderId} completed and email sent`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle expired session
async function handleExpiredSession(session) {
  try {
    await Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'failed' }
    );
    console.log(`❌ Session expired for: ${session.id}`);
  } catch (error) {
    console.error('Error handling expired session:', error);
  }
}

export default router;