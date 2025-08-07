import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple auth storage key
const AUTH_KEY = 'adminAuth';

// Check if token is expired
const isTokenExpired = () => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return true;

    const parsedAuth = JSON.parse(authData);
    if (!parsedAuth.expiry) return true;

    return Date.now() > parsedAuth.expiry;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// Set Sanctum token with 24 hour expiry
const setTokenWithExpiry = (token, user, expiryHours = 24) => {
  try {
    // Clear any existing auth data first to free up space
    clearAuthTokens();

    const expiry = Date.now() + (expiryHours * 60 * 60 * 1000); // 24 hours

    // Store only essential data to minimize localStorage usage
    const authData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiry,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to store auth data:', error);
    // If localStorage is full, clear it and try again
    if (error.name === 'QuotaExceededError') {
      clearAuthTokens();
      try {
        const authData = {
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          expiry: Date.now() + (expiryHours * 60 * 60 * 1000),
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      } catch (retryError) {
        console.error('Failed to store auth data after cleanup:', retryError);
        throw new Error('Unable to store authentication data. Please clear your browser storage.');
      }
    } else {
      throw error;
    }
  }
};

// Clear all auth data
const clearAuthTokens = () => {
  // Remove all possible auth-related keys
  const authKeys = [
    AUTH_KEY,
    'adminToken', // legacy key
    'adminUser', // legacy key
    'adminTokenExpiry', // legacy key
    'jwt_token',
    'justLoggedIn'
  ];

  authKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  });

  // Also clear sessionStorage auth items
  try {
    sessionStorage.removeItem('justLoggedIn');
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
};

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Check if user is authenticated
  const checkAuth = () => {
    try {
      const authData = localStorage.getItem(AUTH_KEY);

      if (!authData) {
        clearAuthTokens();
        return false;
      }

      const parsedAuth = JSON.parse(authData);

      if (!parsedAuth.token || !parsedAuth.user || !parsedAuth.expiry) {
        clearAuthTokens();
        return false;
      }

      // Check if token is expired
      if (Date.now() > parsedAuth.expiry) {
        clearAuthTokens();
        setAuthError('Sesi login Anda telah berakhir. Silakan login kembali.');
        return false;
      }

      if (!parsedAuth.user || parsedAuth.user.role !== 'admin') {
        clearAuthTokens();
        return false;
      }

      setUser(parsedAuth.user);
      return true;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      clearAuthTokens();
      return false;
    }
  };

  // Handle authentication error WITHOUT redirect (let components handle it)
  const handleAuthError = (message = 'Anda harus login sebagai admin terlebih dahulu') => {
    setAuthError(message);
    setIsAuthenticated(false);
    setUser(null);

    // Clear all auth tokens
    clearAuthTokens();

    // DON'T redirect here - let individual components decide
  };

  // Handle API errors
  const handleApiError = (error) => {
    if (error.message.includes('Authentication required') || 
        error.message.includes('401') ||
        error.message.includes('Unauthenticated')) {
      handleAuthError('Sesi login Anda telah berakhir. Silakan login kembali.');
      return true;
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      handleAuthError('Anda tidak memiliki akses untuk melakukan tindakan ini.');
      return true;
    }
    
    return false;
  };

  // Logout function with complete cleanup
  const logout = () => {
    clearAuthTokens();
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
    navigate('/admin/login', { replace: true });
  };

  // Initialize authentication check WITHOUT auto redirect
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);

      if (checkAuth()) {
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // Just set state, don't redirect
        setIsAuthenticated(false);
        setAuthError('Anda harus login sebagai admin terlebih dahulu');
      }

      setIsLoading(false);
    };

    initAuth();

    // Set up token expiry check interval (check every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      if (isTokenExpired()) {
        setIsAuthenticated(false);
        setAuthError('Sesi login Anda telah berakhir. Silakan login kembali.');
        clearAuthTokens();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Force login redirect using window.location to avoid React render issues
  const redirectToLogin = () => {
    window.location.href = '/admin/login';
  };

  // Login function to set Sanctum tokens
  const login = (token, userData, expiryHours = 24) => {
    setTokenWithExpiry(token, userData, expiryHours);
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    authError,
    checkAuth,
    handleAuthError,
    handleApiError,
    logout,
    login,
    clearAuthError,
    redirectToLogin
  };
};

// Utility function to clear localStorage if it's full
const clearLocalStorageIfFull = () => {
  try {
    // Try to set a test item
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return false; // Not full
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Clear non-essential items
      const keysToKeep = ['adminAuth'];
      const allKeys = Object.keys(localStorage);

      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove ${key}:`, e);
          }
        }
      });
      return true; // Was full, now cleared
    }
    return false;
  }
};

// Export Sanctum utilities for use in login component
export { setTokenWithExpiry, clearAuthTokens, isTokenExpired, clearLocalStorageIfFull };

// Re-export AuthErrorComponent for backward compatibility
export { default as AuthErrorComponent } from '../components/auth/AuthErrorComponent';
