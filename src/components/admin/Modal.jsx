import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  backdropClassName = '',
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    full: 'max-w-full mx-4'
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={`modal-overlay fixed inset-0 z-[9999] overflow-y-auto ${backdropClassName}`} {...props}>
          {/* Backdrop */}
          <motion.div
            className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal */}
            <motion.div
              className={`modal-content inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-2xl rounded-xl border border-gray-200 relative z-[10000] ${className}`}
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 20
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <motion.div
                  className={`flex items-center justify-between mb-4 ${headerClassName}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      }
                      className="text-gray-400 hover:text-gray-600 p-1"
                    />
                  )}
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                className={bodyClassName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Modal Header component
const ModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Body component
const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`py-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Footer component
const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 flex justify-end space-x-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Export all components
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
