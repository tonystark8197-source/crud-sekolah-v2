import { useState, useEffect, createContext, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setUser(result.data);
              setToken(storedToken);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              setUser(null);
              setToken(null);
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // On error, try to use stored user data
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
          } catch (parseError) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const { token: newToken, user: userData } = result;
        
        // Store in localStorage
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // API helper with auth
  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication required');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    apiCall
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
