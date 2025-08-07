import React, { createContext, useContext, useState } from 'react';
import CustomAlert from '../components/ui/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showConfirm: false,
    onConfirm: null,
    confirmText: 'Ya',
    cancelText: 'Batal',
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showAlert = ({
    title,
    message,
    type = 'info',
    showConfirm = false,
    onConfirm = null,
    confirmText = 'Ya',
    cancelText = 'Batal',
    autoClose = false,
    autoCloseDelay = 3000
  }) => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
      showConfirm,
      onConfirm,
      confirmText,
      cancelText,
      autoClose,
      autoCloseDelay
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showSuccess = (title, message, autoClose = true) => {
    showAlert({ title, message, type: 'success', autoClose, autoCloseDelay: 3000 });
  };

  const showError = (title, message) => {
    showAlert({ title, message, type: 'error' });
  };

  const showWarning = (title, message) => {
    showAlert({ title, message, type: 'warning' });
  };

  const showInfo = (title, message, autoClose = true) => {
    showAlert({ title, message, type: 'info', autoClose, autoCloseDelay: 3000 });
  };

  const showConfirm = (title, message, onConfirm, confirmText = 'Ya', cancelText = 'Batal') => {
    showAlert({ 
      title, 
      message, 
      type: 'warning', 
      showConfirm: true, 
      onConfirm, 
      confirmText, 
      cancelText 
    });
  };

  const showDeleteConfirm = (title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'error',
      showConfirm: true,
      onConfirm,
      confirmText: 'Hapus',
      cancelText: 'Batal'
    });
  };

  const value = {
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showConfirm={alert.showConfirm}
        onConfirm={alert.onConfirm}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        autoClose={alert.autoClose}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </AlertContext.Provider>
  );
};
