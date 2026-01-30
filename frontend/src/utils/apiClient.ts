/**
 * Global API Client with automatic error handling
 * Handles 401 (Unauthorized) and 403 (Forbidden) responses globally
 */

type FetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Event system for global error handling
type ApiErrorHandler = (error: ApiError) => void;
const errorHandlers: Set<ApiErrorHandler> = new Set();

export const onApiError = (handler: ApiErrorHandler) => {
  errorHandlers.add(handler);
  return () => errorHandlers.delete(handler);
};

const notifyErrorHandlers = (error: ApiError) => {
  errorHandlers.forEach((handler) => handler(error));
};

// Redirect utilities
const redirectToLogin = () => {
  // Clear all auth tokens
  localStorage.removeItem('token');
  localStorage.removeItem('client_token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('auth_user');
  
  // Redirect to login
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login')) {
    window.location.href = '/client/login';
  }
};

const show403UpgradeModal = () => {
  // Dispatch custom event for upgrade modal
  window.dispatchEvent(new CustomEvent('show-upgrade-modal'));
};

/**
 * Enhanced fetch with automatic error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;

  // Add default headers
  const headers = new Headers(fetchOptions.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if available
  const token = localStorage.getItem('token') || 
                localStorage.getItem('client_token') || 
                localStorage.getItem('adminToken');
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      const error: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;

      // Try to parse error body
      try {
        const errorData = await response.json();
        error.data = errorData;
        error.message = errorData.error || errorData.message || error.message;
      } catch {
        // Ignore JSON parse errors
      }

      // Handle 401 - Unauthorized (expired/invalid token)
      if (response.status === 401 && !skipAuthRedirect) {
        console.error('401 Unauthorized - Redirecting to login');
        notifyErrorHandlers(error);
        redirectToLogin();
        throw error;
      }

      // Handle 403 - Forbidden (insufficient permissions/plan)
      if (response.status === 403) {
        console.error('403 Forbidden - Upgrade required');
        notifyErrorHandlers(error);
        show403UpgradeModal();
        throw error;
      }

      // Notify error handlers for other errors
      notifyErrorHandlers(error);
      throw error;
    }

    // Parse successful response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response as any;
  } catch (error) {
    // Network errors or other exceptions
    if (error instanceof Error && !(error as ApiError).status) {
      const apiError: ApiError = error as ApiError;
      apiError.message = `Network error: ${error.message}`;
      notifyErrorHandlers(apiError);
    }
    throw error;
  }
}

/**
 * Convenience methods
 */
export const apiClient = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!(
    localStorage.getItem('token') ||
    localStorage.getItem('client_token') ||
    localStorage.getItem('adminToken')
  );
};

/**
 * Manually trigger logout
 */
export const logout = () => {
  redirectToLogin();
};

export default apiClient;
