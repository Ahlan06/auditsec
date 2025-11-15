# 🔐 AuditSec - Freelance Cybersecurity & Pentesting

> **Professional freelance cybersecurity services by Ahlan Mira**

AuditSec is a freelance cybersecurity platform offering professional penetration testing, OSINT investigations, and network security audits. Developed with modern web technologies to provide a seamless client experience.

**👨‍💻 Created by Ahlan Mira**
- 📧 **Email**: ahlan.mira@icloud.com
- 🌐 **Web Site**: [Portfolio](https://auditsec.vercel.app/)

## 🌟 About

AuditSec is a **freelance cybersecurity platform** specializing in:

### 🛡️ **Core Services**
- **Web Penetration Testing** - Professional web application security assessments
- **OSINT Investigations** - Digital footprint analysis and leak detection
- **Network Security Audits** - Infrastructure vulnerability assessments
- **Security Consulting** - Custom security solutions for businesses

### 🎨 **Platform Features**
- **Modern UI/UX**: Apple-inspired minimalist design with smooth animations
- **Service Booking**: Direct contact and service request system via EmailJS
- **Dark/Light Mode**: Adaptive theme switching for better user experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Multi-language Support**: Interface available in multiple languages
- **Secure Payments**: Integrated Stripe checkout for service bookings

### 💼 **Professional Approach**
- Detailed security reports with executive summaries
- OWASP Top 10 methodology compliance
- Confidential and ethical testing practices
- Post-audit support and remediation guidance

## 💻 Technologies

This platform is built entirely with modern **JavaScript/Node.js** ecosystem:

### **Frontend - React**
- **React 18** - Modern component-based UI library with hooks
- **Vite** - Lightning-fast build tool and development server
- **JavaScript (ES6+)** - Modern JavaScript with async/await patterns
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router v6** - Client-side routing and navigation
- **Zustand** - Lightweight state management (cart, theme, language)
- **Framer Motion** - Declarative animations and transitions
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API requests

### **Backend - Node.js**
- **Node.js v18+** - JavaScript runtime environment
- **Express.js** - Minimalist web application framework
- **JavaScript (ES6+)** - Server-side JavaScript
- **Stripe SDK** - Payment processing integration
- **CORS** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management

### **Communication**
- **EmailJS** - Contact form email delivery (no backend needed)
- **Stripe Webhooks** - Real-time payment event handling

### **Development Tools**
- **ESLint** - JavaScript code linting and quality
- **PostCSS** - CSS transformation and optimization
- **Autoprefixer** - Automatic CSS vendor prefixing

### **Language**
- **JavaScript/Node.js** throughout the entire stack
- No TypeScript, Python, PHP, or other languages used
- Pure JavaScript for maximum simplicity and performance

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm/yarn
- **Stripe account** (test mode for development)
- **EmailJS account** (service_unu4yrs, template_z2ejwrm)
- AWS S3 account (optional, for production file storage)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Ahlan06/auditsec.git
cd auditsec
```

**2. Install Backend Dependencies**
```powershell
cd backend
npm install
```

**3. Install Frontend Dependencies**
```powershell
cd ../frontend
npm install
```

### Configuration

#### Frontend Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLIC_KEY=pk_test_51STq1l5hco1g4w...
```

#### Backend Environment Variables
Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_51STq1l5hco1g4w...
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optional)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_key

# AWS S3 (production only)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-west-3
AWS_BUCKET_NAME=your_bucket_name
```

#### EmailJS Setup
In `frontend/src/pages/ContactPageApple.jsx`, configure:
```javascript
serviceID: 'service_unu4yrs'    // Your EmailJS service ID
templateID: 'template_z2ejwrm'  // Your EmailJS template ID
publicKey: 'your_public_key'    // Your EmailJS public key
```

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```powershell
cd backend
node server-simple.js
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

#### Production Build

**Frontend:**
```powershell
cd frontend
npm run build
npm run preview
```

**Backend:**
```powershell
cd backend
npm start
```

## 📁 Project Structure

```
AuditSec/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── HeaderApple.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductFilter.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── ProductsPageApple.jsx
│   │   │   ├── ServicesPageApple.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── ContactPageApple.jsx
│   │   │   └── PaymentSuccessPage.jsx
│   │   ├── store/               # Zustand state management
│   │   │   ├── cartStore.js
│   │   │   └── themeStore.js
│   │   ├── services/            # API services
│   │   │   └── api.js
│   │   ├── App.jsx              # Main application
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── routes/                  # API routes
│   │   └── payments.js
│   ├── server.js                # Main server (MongoDB)
│   ├── server-simple.js         # Simplified Stripe-only server
│   ├── package.json
│   └── .env
│
└── README.md
```

## 💳 Stripe Integration

### Test Cards
Use these cards in test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Webhook Setup
For local testing:
```powershell
stripe listen --forward-to localhost:3001/api/payments/stripe-webhook
```

## 🎨 Key Pages

1. **Home** (`/`) - Landing page with hero section
2. **Services** (`/services`) - Professional cybersecurity services showcase
3. **Products** (`/products`) - Security audit packages (Apple-inspired design)
4. **Guides** (`/guides`) - Educational resources and tutorials
5. **Cart** (`/cart`) - Shopping cart with order summary
6. **Checkout** (`/checkout`) - Payment method selection (Stripe/Crypto)
7. **Contact** (`/contact`) - Contact form with EmailJS integration
8. **Payment Success** (`/payment-success`) - Order confirmation page

### 📧 Contact Information
- **Email**: ahlan.mira@icloud.com (via contact form or direct)
- 🌐 **Telegram**: [@Ahlan06](https://t.me/Ahlan06)
- **EmailJS**: Configured with Gmail service (service_unu4yrs)

## ✨ Key Features

### ✅ Live Features
- Professional service showcase with detailed descriptions
- Direct contact system via EmailJS
- Stripe payment integration for service bookings
- Interactive guides and educational resources
- Dark/Light theme with smooth transitions
- Fully responsive across all devices
- Multi-language interface support
- Apple-inspired minimalist design

### 🎯 Future Enhancements
- Client portal for project tracking
- Automated report delivery system
- Service review and testimonials
- Blog for security insights
- Multi-currency support

## 🚀 Deployment

### Frontend (Vercel/Netlify recommended)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Configure environment variables on hosting platform
# Deploy via Git or platform CLI
```

### Environment Setup
Ensure all environment variables are properly configured in your hosting platform:
- Stripe API keys (production mode)
- EmailJS credentials
- AWS S3 credentials (if using file storage)
- CORS origins updated for production URLs

### Repository
- **GitHub**: [github.com/Ahlan06/auditsec](https://github.com/Ahlan06/auditsec)
- **Issues**: Report bugs or request features via GitHub Issues
- **Contributions**: Pull requests welcome

## 🎨 Design System

### Brand Identity
- **Name**: AuditSec
- **Tagline**: Professional Security Services
- **Focus**: Cybersecurity auditing, penetration testing, OSINT

### Colors
- **Primary Blue**: #0071e3 (Apple-inspired)
- **Service Gradients**: 
  - Blue → Purple (Web Pentest)
  - Green → Teal (OSINT)
  - Orange → Red (Network Audit)
- **Background Dark**: #000000, #1d1d1f, #2d2d2f
- **Background Light**: #ffffff, #f5f5f7

### Typography
- **Font Family**: SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif
- **Style**: Minimalist Apple-inspired design
- **Headings**: Bold, clean, modern
- **Body**: Regular, highly readable

## ⚖️ Legal & Ethics

> **⚠️ IMPORTANT**: All services offered by AuditSec are strictly for **authorized security testing** and **ethical auditing** purposes only.

### Professional Ethics:
- ✅ Authorized penetration testing with written permission
- ✅ Legitimate security audits for businesses
- ✅ Cybersecurity research and education
- ✅ Confidentiality and non-disclosure agreements

### Prohibited Activities:
- ❌ Unauthorized access to systems
- ❌ Malicious or illegal activities
- ❌ Testing without explicit permission
- ❌ Misuse of discovered vulnerabilities

**All engagements require proper authorization and legal agreements.**

## 📞 Contact & Booking

**Ahlan Mira - Freelance Cybersecurity Professional**

- 📧 **Email**: ahlan.mira@icloud.com
- 🌐 **Telegram**: [@Ahlan06](https://t.me/Ahlan06)
- 🌐 **Portfolio**: [miraportfolio.vercel.app](https://miraportfolio.vercel.app/)
- 💼 **GitHub**: [@Ahlan06](https://github.com/Ahlan06)
- 📝 **Contact Form**: Available on website

*Professional inquiries and service bookings welcome*

---

<div align="center">

---

## 🔐 AuditSec

**Professional Cybersecurity Auditing & Pentesting Services**

*Empowering businesses with professional security assessments*

---

**👨‍💻 Developed by Ahlan Mira**

📧 ahlan.mira@icloud.com | 🌐 [@Ahlan06](https://t.me/Ahlan06) | 💼 [GitHub](https://github.com/Ahlan06/auditsec)

**Built with precision for security professionals**

---

*© 2025 AuditSec - Professional Security Services*

</div>#   a u d i t s e c  
 