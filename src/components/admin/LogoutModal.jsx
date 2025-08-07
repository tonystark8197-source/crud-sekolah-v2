import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleConfirm = () => {
    setIsLoading(true);
    setCountdown(5);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Set logout success flag for login page
          sessionStorage.setItem('logoutSuccess', 'true');
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    // Prevent closing when clicking backdrop during countdown
    if (!isLoading) {
      handleClose();
    }
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop - Full screen overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all overflow-hidden">
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Konfirmasi Logout
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-600 text-center mb-6">
                {isLoading
                  ? 'Apakah Anda yakin ingin keluar dari sistem admin? Anda akan diarahkan ke halaman login.'
                  : 'Apakah Anda yakin ingin keluar dari sistem admin? Anda akan diarahkan ke halaman login.'
                }
              </p>

              {/* Progress Bar Countdown Display */}
              {isLoading && (
                <div className="mb-6 text-center px-2">
                  {/* Progress bar container with proper constraints */}
                  <div className="mx-auto max-w-full">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${((5 - countdown + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Logout dalam <span className="font-semibold text-red-600">{countdown}</span> detik...
                  </p>
                </div>
              )}

              {/* Buttons */}
              {!isLoading && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Ya, Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
