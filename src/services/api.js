const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
import { clearAuthTokens } from '../hooks/useAdminAuth';

const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return null;

    const parsedAuth = JSON.parse(authData);
    if (!parsedAuth.token || !parsedAuth.expiry) return null;

    if (Date.now() > parsedAuth.expiry) {
      clearAuthTokens();
      return null;
    }

    return parsedAuth.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    clearAuthTokens();
    return null;
  }
};


const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;

    let errorData = null;
    let isJson = false;
    try {
      errorData = await response.clone().json();
      isJson = true;
    } catch {
      // Not JSON, try to get text (could be HTML error page)
      try {
        const text = await response.text();
        if (text && text.startsWith('<!DOCTYPE')) {
          errorMessage = `Server returned an HTML error page (status ${response.status})`;
        } else if (text) {
          errorMessage = text;
        }
      } catch {
        // Ignore, keep default errorMessage
      }
    }

    if (isJson && errorData) {
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }

    if (response.status === 401) {
      clearAuthTokens();
      throw new Error('Authentication required');
    }
    if (response.status === 403) {
      throw new Error('Access forbidden');
    }
    if (response.status === 404) {
      throw new Error(`Route not found: ${errorMessage}`);
    }
    if (response.status === 422) {
      throw new Error(`Validation error: ${errorMessage}`);
    }
    if (response.status === 500) {
      throw new Error(`Server error: ${errorMessage}`);
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    // If response is not JSON, return empty object
    return { success: true };
  }
};

// API service object
export const api = {
  // GET request
  get: async (endpoint, options = {}) => {
    const token = getAuthToken();
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    console.log('🌐 API GET Request:', {
      url: fullUrl,
      endpoint: endpoint,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None'
    });

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(fullUrl, config);

    console.log('📡 API GET Response:', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    return { data: await handleResponse(response) };
  },

  // POST request
  post: async (endpoint, data = null, options = {}) => {
    const token = getAuthToken();

    // Check if data is FormData (for file uploads)
    const isFormData = data instanceof FormData;

    const config = {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      // Don't stringify FormData
      ...(data && { body: isFormData ? data : JSON.stringify(data) }),
      ...options,
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;

    // Only log for debugging specific endpoints
    if (endpoint.includes('logout')) {
      console.log('API POST request:', {
        url: fullUrl,
        endpoint: endpoint,
        hasToken: !!token,
        method: 'POST'
      });
    }

    const response = await fetch(fullUrl, config);
    return { data: await handleResponse(response) };
  },

  // PUT request
  put: async (endpoint, data = null, options = {}) => {
    const token = getAuthToken();

    // Check if data is FormData (for file uploads)
    const isFormData = data instanceof FormData;

    const config = {
      method: 'PUT',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      // Don't stringify FormData
      ...(data && { body: isFormData ? data : JSON.stringify(data) }),
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return { data: await handleResponse(response) };
  },

  // DELETE request
  delete: async (endpoint, options = {}) => {
    const token = getAuthToken();
    const config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return { data: await handleResponse(response) };
  },

  // PATCH request
  patch: async (endpoint, data = null, options = {}) => {
    const token = getAuthToken();
    const config = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...(data && { body: JSON.stringify(data) }),
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return { data: await handleResponse(response) };
  },

  // File upload helper
  upload: async (endpoint, formData, options = {}) => {
    const token = getAuthToken();
    const config = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        // Don't set Content-Type for FormData - let browser set it with boundary
        ...options.headers,
      },
      body: formData,
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return { data: await handleResponse(response) };
  }
};

export default api;
