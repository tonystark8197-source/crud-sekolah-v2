import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UniversalModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer = null,
  ...props
}) => {
  // Handle body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Also apply to html element
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.scrollbarWidth = 'none';
      document.documentElement.style.msOverflowStyle = 'none';
      
      // Add CSS to hide webkit scrollbars
      const style = document.createElement('style');
      style.id = 'universal-modal-scrollbar-hide';
      style.textContent = `
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        html, body, * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .modal-open {
          overflow: hidden !important;
        }
        .modal-open::-webkit-scrollbar {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Add class to body
      document.body.classList.add('modal-open');
      
      return () => {
        // Remove the style
        const styleElement = document.getElementById('universal-modal-scrollbar-hide');
        if (styleElement) {
          styleElement.remove();
        }
        
        // Remove class from body
        document.body.classList.remove('modal-open');
        
        // Restore scroll position and remove fixed positioning
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        document.documentElement.style.overflow = '';
        document.documentElement.style.scrollbarWidth = '';
        document.documentElement.style.msOverflowStyle = '';
        
        window.scrollTo(scrollX, scrollY);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          style={{ 
            overflow: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onClick={handleBackdropClick}
          {...props}
        >
          <motion.div 
            className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Header - Fixed */}
            <div className={`flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0 ${headerClassName}`}>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Modal Content - Scrollable */}
            <div 
              className={`flex-1 overflow-y-auto p-6 ${bodyClassName}`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {children}
            </div>

            {/* Modal Footer - Fixed (if provided) */}
            {footer && (
              <div className={`flex justify-end space-x-3 p-6 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0 ${footerClassName}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UniversalModal;
