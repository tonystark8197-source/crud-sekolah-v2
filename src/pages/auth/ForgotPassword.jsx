import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { settings } = useSchoolSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setErrors({ email: 'Email harus diisi' });
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Format email tidak valid' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        // Show success message
        await Swal.fire({
          title: 'Email Terkirim!',
          html: `
            <div class="text-center">
              <i class="fas fa-envelope text-blue-500 text-4xl mb-3"></i>
              <p class="text-gray-600 mb-2">Kode verifikasi telah dikirim ke:</p>
              <p class="font-semibold text-blue-600">${email}</p>
              <p class="text-sm text-gray-500 mt-2">Silakan periksa email Anda dan masukkan kode verifikasi 6 karakter.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Lanjutkan',
          confirmButtonColor: '#3B82F6'
        });

        // Navigate to verify code page with email
        navigate('/admin/verify-code', { state: { email } });
      } else {
        setErrors({ general: response.data.message || 'Gagal mengirim email reset password' });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setErrors({ email: error.response.data.message || 'Email tidak ditemukan dalam sistem' });
      } else if (error.response?.status === 500) {
        setErrors({ general: error.response.data.message || 'Gagal mengirim email. Silakan coba lagi.' });
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.' });
      }
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
            {!settings?.loading && settings?.logoUrl ? (
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
              style={{ display: (!settings?.loading && settings?.logoUrl) ? 'none' : 'flex' }}
            >
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Lupa Password</h1>
          <p className="text-black">
            Masukkan email Anda untuk menerima kode verifikasi
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan email Anda"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
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
                  Mengirim...
                </div>
              ) : (
                'Kirim Kode Verifikasi'
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-black hover:text-blue-600 text-sm transition duration-300"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
