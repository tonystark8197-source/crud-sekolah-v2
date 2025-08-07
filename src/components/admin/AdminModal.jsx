import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../../hooks/useSidebar';

const AdminModal = ({
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
  ...props
}) => {
  const { sidebarWidth } = useSidebar();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll completely and hide all scrollbars
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-y', scrollY);

      // Hide horizontal scrollbars specifically and style modal scrollbar
      const style = document.createElement('style');
      style.id = 'admin-modal-scroll-hide';
      style.textContent = `
        body, html {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        .overflow-x-auto {
          overflow-x: hidden !important;
        }
        /* Prevent any scrolling on main content */
        #root, .app-container, .main-content {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        /* Custom scrollbar for modal content */
        .admin-modal-content::-webkit-scrollbar {
          width: 6px;
        }
        .admin-modal-content::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .admin-modal-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .admin-modal-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore scroll position and remove custom styles
      const scrollY = document.body.getAttribute('data-scroll-y') || document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');

      // Remove custom scroll hide styles
      const customStyle = document.getElementById('admin-modal-scroll-hide');
      if (customStyle) {
        customStyle.remove();
      }

      // Restore scroll position
      if (scrollY) {
        const scrollPosition = typeof scrollY === 'string' && scrollY.startsWith('-')
          ? parseInt(scrollY.slice(1))
          : parseInt(scrollY || '0');
        window.scrollTo(0, scrollPosition);
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // Calculate modal position to center it properly
  const isDesktop = window.innerWidth >= 900; // Changed to 900px as requested
  const modalStyle = {
    left: isDesktop ? `${sidebarWidth}px` : '0',
    width: isDesktop ? `calc(100% - ${sidebarWidth}px)` : '100%',
    right: '0'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={modalStyle}
          {...props}
        >
          {/* Backdrop */}
          <motion.div
            className="flex items-center justify-center min-h-screen px-4 py-6 lg:px-16 lg:py-8"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal Content */}
            <motion.div
              className={`w-full ${sizeClasses[size]} mx-auto p-0 overflow-hidden text-left bg-white rounded-xl border border-gray-300 relative z-[10000] ${className}`}
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
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
                  className={`flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl ${headerClassName}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title && (
                    <h3 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                className={`admin-modal-content p-6 max-h-[calc(100vh-160px)] overflow-y-auto overflow-x-hidden ${bodyClassName}`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
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
    </AnimatePresence>
  );
};

// Modal Header component
const AdminModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Body component  
const AdminModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`py-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Modal Footer component
const AdminModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-200 pt-6 mt-6 flex justify-end space-x-3 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  );
};

// Export all components
AdminModal.Header = AdminModalHeader;
AdminModal.Body = AdminModalBody;
AdminModal.Footer = AdminModalFooter;

export default AdminModal;
