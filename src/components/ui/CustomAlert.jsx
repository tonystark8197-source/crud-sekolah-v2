import { useState, useEffect, useCallback } from 'react';

// Simple icon components
const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  showConfirm = false,
  onConfirm,
  confirmText = 'Ya',
  cancelText = 'Batal',
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 150);
  }, [onClose]);

  useEffect(() => {
    let autoCloseTimer;

    if (isOpen) {
      setIsVisible(true);

      if (autoClose && !showConfirm) {
        autoCloseTimer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
      }
    } else {
      setIsVisible(false);
    }

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen, autoClose, autoCloseDelay, showConfirm, handleClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const getIcon = () => {
    const iconClass = "h-6 w-6";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-600`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-600`} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  if (!isOpen) return null;

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={!showConfirm ? handleClose : undefined}
        />

        {/* Alert Panel */}
        <div className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 ${
          isVisible ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
        }`}>
          
          {/* Close button for non-confirm alerts */}
          {!showConfirm && (
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          <div className={`rounded-md p-4 ${colors.bg} ${colors.border} border`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${colors.title}`}>
                  {title}
                </h3>
                {message && (
                  <div className={`mt-2 text-sm ${colors.message}`}>
                    <p>{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons for confirm dialogs */}
          {showConfirm && (
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 ${colors.button}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                onClick={handleClose}
              >
                {cancelText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
