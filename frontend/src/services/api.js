import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const isApiConfigured = Boolean(API_BASE_URL);

const requireApi = (featureName = 'This feature') => {
  if (!isApiConfigured) {
    throw new Error(`${featureName} is not available in demo mode (API not configured).`);
  }
};

// Create axios instance only when API is configured
const api = isApiConfigured
  ? axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    })
  : null;

// Request interceptor
if (api) {
  api.interceptors.request.use(
    (config) => {
      // Add any auth tokens here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Response interceptor
if (api) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

// Payment API
export const paymentAPI = {
  // Create Stripe checkout session
  createStripeSession: async (items, customerEmail) => {
    requireApi('Payments');
    const response = await api.post('/payments/create-checkout-session', {
      items,
      customerEmail
    });
    return response.data;
  },

  // Create crypto payment
  createCryptoPayment: async (items, customerEmail, cryptoCurrency) => {
    requireApi('Crypto payments');
    const response = await api.post('/crypto/create-crypto-payment', {
      items,
      customerEmail,
      cryptoCurrency
    });
    return response.data;
  },

  // Check crypto payment status
  checkCryptoPaymentStatus: async (orderId) => {
    requireApi('Crypto payments');
    const response = await api.get(`/crypto/crypto-payment-status/${orderId}`);
    return response.data;
  }
};

// Products API
export const productsAPI = {
  // Get all products
  getAllProducts: async () => {
    requireApi('Product catalog');
    const response = await api.get('/products');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    requireApi('Product catalog');
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    requireApi('Product catalog');
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  }
};

// Orders API
export const ordersAPI = {
  // Get order by ID
  getOrderById: async (orderId) => {
    requireApi('Orders');
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order by email
  getOrdersByEmail: async (email) => {
    requireApi('Orders');
    const response = await api.get(`/orders/email/${email}`);
    return response.data;
  }
};

// Downloads API
export const downloadsAPI = {
  // Get download URL using token
  getDownloadUrl: async (token) => {
    requireApi('Downloads');
    const response = await api.get(`/downloads/${token}`);
    return response.data;
  },

  // Get download status for order
  getDownloadStatus: async (orderId) => {
    requireApi('Downloads');
    const response = await api.get(`/downloads/status/${orderId}`);
    return response.data;
  }
};

export default api;
