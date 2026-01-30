import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const authClient = axios.create({ baseURL: `${BASE}/auth`, timeout: 20000 });

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  // Manual auth
  async register({ email, password, firstName, lastName }) {
    const { data } = await authClient.post('/register', { email, password, firstName, lastName });
    return data;
  },
  async login({ email, password }) {
    const { data } = await authClient.post('/login', { email, password });
    return data;
  },
  async me() {
    const { data } = await authClient.get('/me');
    return data;
  },

  // OAuth (server redirects to provider)
  oauthStartUrl(provider, next) {
    const url = new URL(`${BASE}/auth/oauth/${provider}`);
    if (next) url.searchParams.set('next', next);
    return url.toString();
  },

  // Phone auth (SMS OTP)
  async phoneStart(phone) {
    const { data } = await authClient.post('/phone/start', { phone });
    return data;
  },
  async phoneVerify(phone, code) {
    const { data } = await authClient.post('/phone/verify', { phone, code });
    return data;
  },

  // Password reset
  async forgotPasswordEmail(email) {
    const { data } = await authClient.post('/password/forgot', { email, channel: 'email' });
    return data;
  },
  async forgotPasswordSms(phone) {
    const { data } = await authClient.post('/password/forgot', { phone, channel: 'sms' });
    return data;
  },
  async resetPasswordWithToken(token, newPassword) {
    const { data } = await authClient.post('/password/reset/token', { token, newPassword });
    return data;
  },
  async resetPasswordWithSms(phone, code, newPassword) {
    const { data } = await authClient.post('/password/reset/sms', { phone, code, newPassword });
    return data;
  },

  // Verification
  async requestEmailVerification() {
    const { data } = await authClient.post('/verify/email/request');
    return data;
  },
  async confirmEmailVerification(token) {
    const { data } = await authClient.post('/verify/email/confirm', { token });
    return data;
  },
  async requestPhoneVerification(phone) {
    const { data } = await authClient.post('/verify/phone/request', { phone });
    return data;
  },
  async confirmPhoneVerification(code) {
    const { data } = await authClient.post('/verify/phone/confirm', { code });
    return data;
  },
};
