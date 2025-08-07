import React from 'react';
import { useThemeSettings } from '../../hooks/useThemeSettings';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const { getColor } = useThemeSettings();

  // Get theme colors
  const primaryColor = getColor('global', 'primary', 'main', '#3B82F6');
  const primaryHover = getColor('global', 'primary', 'hover', '#2563EB');

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variants = {
    primary: `text-white focus:ring-2`,
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline focus:ring-blue-500'
  };

  // Size styles
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Combine classes
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  // Dynamic styles for primary variant
  const dynamicStyle = variant === 'primary' ? {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    '--tw-ring-color': primaryColor + '50'
  } : {};

  return (
    <button
      type={type}
      className={buttonClasses}
      style={dynamicStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.target.style.backgroundColor = primaryHover;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.target.style.backgroundColor = primaryColor;
        }
      }}
      {...props}
    >
      {loading && <LoadingSpinner />}

      {!loading && icon && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>
          {icon}
        </span>
      )}

      {children && (
        <span>
          {children}
        </span>
      )}

      {!loading && icon && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
