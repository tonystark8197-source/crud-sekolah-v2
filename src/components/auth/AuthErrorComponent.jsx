import React from 'react';

const AuthErrorComponent = ({ authError, clearAuthError, redirectToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">
            {authError || 'Anda harus login sebagai admin untuk mengakses halaman ini.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={redirectToLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Login Sekarang
            </button>
            <button
              onClick={clearAuthError}
              className="w-full text-gray-500 hover:text-gray-700 transition duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorComponent;
