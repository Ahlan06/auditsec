import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Generate download tokens for order products
export const generateDownloadTokens = async (products) => {
  const expirationHours = parseInt(process.env.DOWNLOAD_LINK_EXPIRATION) || 24;
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  return products.map(product => ({
    productId: product.productId,
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt,
    used: false
  }));
};

// Create email transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Fallback to SMTP (configure for your email provider)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
};

// Send order confirmation email with download links
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Generate download links
    const downloadLinks = order.downloadTokens.map(token => {
      const product = order.products.find(p => 
        p.productId._id.toString() === token.productId.toString()
      );
      
      return {
        productName: product?.name || 'Unknown Product',
        downloadUrl: `${frontendUrl}/download/${token.token}`,
        expiresAt: token.expiresAt
      };
    });

    const emailHtml = generateOrderEmailTemplate(order, downloadLinks);

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@auditsec.com',
      to: order.customerEmail,
      subject: `🔐 AuditSec - Your Order ${order.orderId} is Ready!`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    
    // Update order to mark email as sent
    order.emailSent = true;
    order.emailSentAt = new Date();
    await order.save();

    console.log(`📧 Email sent to ${order.customerEmail} for order ${order.orderId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Generate HTML email template
const generateOrderEmailTemplate = (order, downloadLinks) => {
  const formatPrice = (price) => `€${price.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuditSec - Order Confirmation</title>
    <style>
      body {
        font-family: 'Courier New', monospace;
        background-color: #0a0a0a;
        color: #00ff00;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #1a1a1a;
        border: 2px solid #00ff00;
        padding: 30px;
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #00ff00;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #00ff00;
      }
      .tagline {
        color: #888;
        margin-top: 5px;
      }
      .order-info {
        background-color: #000;
        padding: 15px;
        border-left: 4px solid #00ff00;
        margin: 20px 0;
      }
      .product-item {
        background-color: #1a1a1a;
        border: 1px solid #333;
        padding: 15px;
        margin: 10px 0;
      }
      .download-btn {
        background-color: #00ff00;
        color: #000;
        padding: 10px 20px;
        text-decoration: none;
        border: none;
        display: inline-block;
        margin-top: 10px;
        font-weight: bold;
        text-transform: uppercase;
      }
      .download-btn:hover {
        background-color: #00cc00;
      }
      .warning {
        background-color: #330000;
        border-left: 4px solid #ff6600;
        padding: 15px;
        margin: 20px 0;
        color: #ff6600;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #333;
        color: #666;
      }
      .ascii-art {
        color: #00ff00;
        font-size: 12px;
        text-align: center;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">AuditSec</div>
        <div class="tagline">Ethical Hacking • Pentest • OSINT</div>
      </div>

      <div class="ascii-art">
╔═══════════════════════════════════════╗
║     ORDER CONFIRMATION RECEIVED      ║
║          [STATUS: COMPLETED]         ║
╚═══════════════════════════════════════╝
      </div>

      <div class="order-info">
        <strong>Order ID:</strong> ${order.orderId}<br>
        <strong>Date:</strong> ${formatDate(order.createdAt)}<br>
        <strong>Total:</strong> ${formatPrice(order.totalAmount)}<br>
        <strong>Status:</strong> COMPLETED ✅
      </div>

      <h3>📦 Your Digital Products</h3>
      
      ${downloadLinks.map(link => `
        <div class="product-item">
          <strong>${link.productName}</strong><br>
          <small>Expires: ${formatDate(link.expiresAt)}</small><br>
          <a href="${link.downloadUrl}" class="download-btn">🔽 Download Now</a>
        </div>
      `).join('')}

      <div class="warning">
        ⚠️ IMPORTANT SECURITY NOTICE:
        <ul>
          <li>Download links expire in 24 hours</li>
          <li>Each link can only be used once</li>
          <li>Products are for legal/ethical use only</li>
          <li>Keep your downloads secure</li>
        </ul>
      </div>

      <div class="ascii-art">
> Access granted. Happy hacking! <
      </div>

      <div class="footer">
        <p>Questions? Contact us: ahlan.mira@icloud.com</p>
        <p><small>AuditSec - Empowering Ethical Hackers</small></p>
      </div>
    </div>
  </body>
  </html>
  `;
};