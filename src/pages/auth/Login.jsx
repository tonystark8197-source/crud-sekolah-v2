import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokenWithExpiry, clearAuthTokens, clearLocalStorageIfFull } from '../../hooks/useAdminAuth';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSchoolSettings();

  // Check for logout success message
  useEffect(() => {
    const logoutSuccess = sessionStorage.getItem('logoutSuccess');
    if (logoutSuccess) {
      setShowLogoutSuccess(true);
      sessionStorage.removeItem('logoutSuccess');

      // Auto hide after 2 seconds
      const timer = setTimeout(() => {
        setShowLogoutSuccess(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // TODO: Implement Google OAuth integration
      // For now, show a placeholder message
      setErrors({
        general: 'Login Google sedang dalam pengembangan. Silakan gunakan email dan password.'
      });

      // Future implementation:
      // 1. Redirect to Google OAuth
      // 2. Handle callback
      // 3. Send Google token to backend
      // 4. Receive JWT token and user data
      // 5. Store token and redirect to dashboard

      console.log('Google login initiated');
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({
        general: 'Gagal melakukan login dengan Google. Silakan coba lagi.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        try {
          // Clear any existing auth data first
          clearAuthTokens();

          // Store Sanctum token with expiry based on remember me option
          const expiryHours = formData.rememberMe ? 24 * 30 : 24; // 30 days if remember me, otherwise 24 hours
          setTokenWithExpiry(result.token, result.user, expiryHours);

          // Set flag for welcome modal
          sessionStorage.setItem('justLoggedIn', 'true');

          console.log('Sanctum Login successful:', {
            token_preview: result.token.substring(0, 20) + '...',
            user: result.user.name,
            expires_in: result.expires_in,
            expires_at: result.expires_at
          });

          // Redirect to dashboard
          navigate('/admin/dashboard', { replace: true });
        } catch (storageError) {
          console.error('Storage error:', storageError);

          // If it's a quota exceeded error, try to clear localStorage and retry
          if (storageError.message.includes('quota') || storageError.name === 'QuotaExceededError') {
            const wasCleared = clearLocalStorageIfFull();
            if (wasCleared) {
              try {
                const expiryHours = formData.rememberMe ? 24 * 30 : 24;
                setTokenWithExpiry(result.token, result.user, expiryHours);
                sessionStorage.setItem('justLoggedIn', 'true');
                navigate('/admin/dashboard', { replace: true });
                return;
              } catch (retryError) {
                console.error('Retry storage error:', retryError);
              }
            }
          }

          setErrors({
            general: 'Gagal menyimpan data login. Silakan bersihkan cache browser dan coba lagi.'
          });
        }
      } else {
        setErrors({
          general: result.error || 'Email atau password salah'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'Terjadi kesalahan koneksi. Silakan coba lagi.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4">
            {!settingsLoading && settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`Logo ${settings.schoolShortName}`}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <div
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
              style={{ display: (!settingsLoading && settings.logoUrl) ? 'none' : 'flex' }}
            >
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Admin Login</h1>
          <p className="text-black">
            {settingsLoading ? 'Loading...' : settings.schoolName || 'Portal Sekolah'}
          </p>
        </div>

        {/* Logout Success Alert */}
        {showLogoutSuccess && (
          <div className={`mb-4 bg-green-50 border border-green-200 rounded-lg p-4 transition-all duration-300 ${
            showLogoutSuccess ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Logout berhasil!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Anda telah keluar dari sistem admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
          {/* Google Login Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium">Masuk dengan Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan email Anda"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition duration-300"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-200 text-sm transition duration-300"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
