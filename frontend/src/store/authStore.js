import { create } from 'zustand';
import { authApi } from '../services/authApi';

const STORAGE_KEY = 'auth_token';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(STORAGE_KEY) || null,
  user: safeJsonParse(localStorage.getItem('auth_user')),
  isLoading: false,
  error: null,

  setToken: (token) => {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
    set({ token: token || null });
  },

  setUser: (user) => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
    set({ user: user || null });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('auth_user');
    set({ token: null, user: null, error: null });
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(payload);
      get().setToken(data.token);
      get().setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(payload);
      get().setToken(data.token);
      get().setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPhone: async ({ phone, code }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.phoneVerify(phone, code);
      get().setToken(data.token);
      get().setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Phone login failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  hydrateMe: async () => {
    if (!get().token) return null;
    try {
      const data = await authApi.me();
      get().setUser(data.user);
      return data.user;
    } catch {
      // Token invalid/expired
      get().logout();
      return null;
    }
  },

  acceptOAuthToken: async (token) => {
    get().setToken(token);
    return get().hydrateMe();
  },
}));

export default useAuthStore;
