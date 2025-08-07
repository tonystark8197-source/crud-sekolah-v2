import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSchoolSettings();
  const inputRefs = useRef([]);

  const email = location.state?.email;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/admin/forgot-password');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format countdown display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    // Allow letters and numbers, convert to uppercase
    if (!/^[A-Za-z0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setErrors({});

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const cleanText = text.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
        if (cleanText.length === 6) {
          const newCode = cleanText.split('');
          setCode(newCode);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setErrors({ code: 'Kode verifikasi harus 6 karakter' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-code', {
        email,
        code: verificationCode
      });

      if (response.data.success) {
        await Swal.fire({
          title: 'Kode Berhasil Diverifikasi!',
          html: `
            <div class="text-center">
              <i class="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
              <p class="text-gray-600">Kode verifikasi valid. Anda akan diarahkan untuk membuat password baru.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Lanjutkan',
          confirmButtonColor: '#10B981'
        });

        // Navigate to reset password page with token
        navigate('/admin/reset-password', { 
          state: { 
            email, 
            token: response.data.token 
          } 
        });
      } else {
        setErrors({ code: response.data.message || 'Kode verifikasi tidak valid' });
      }
    } catch (error) {
      console.error('Verify code error:', error);
      if (error.response?.status === 400) {
        setErrors({ code: 'Kode verifikasi tidak valid atau sudah kadaluarsa' });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setCountdown(300); // Reset countdown
        await Swal.fire({
          title: 'Kode Baru Terkirim!',
          text: 'Kode verifikasi baru telah dikirim ke email Anda.',
          icon: 'success',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setErrors({ general: 'Gagal mengirim ulang kode. Silakan coba lagi.' });
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Verifikasi Kode</h1>
          <p className="text-black mb-2">
            Masukkan kode 6 karakter yang telah dikirim ke:
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
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

            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Kode Verifikasi (3 Huruf + 3 Angka)
              </label>
              <div className="flex justify-center space-x-2 mb-4">
                {code.map((char, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={char}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={index < 3 ? "A" : "1"}
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-red-600 text-sm text-center">{errors.code}</p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-blue-100 text-sm">
                Kode akan kadaluarsa dalam: <span className="font-semibold text-white">{formatTime(countdown)}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ${
                isLoading || code.join('').length !== 6
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
                  Memverifikasi...
                </div>
              ) : (
                'Verifikasi Kode'
              )}
            </button>

            {/* Resend Code */}
            {countdown === 0 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-blue-200 hover:text-white text-sm transition duration-300 underline"
                >
                  Kirim Ulang Kode
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Back to Forgot Password */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin/forgot-password')}
            className="text-black hover:text-blue-600 text-sm transition duration-300"
          >
            ← Kembali ke Lupa Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
