import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperClassName = '',
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  // Base input styles
  const baseInputStyles = 'block w-full border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';

  // Size styles
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  // Variant styles
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };

  // Determine variant based on error
  const currentVariant = error ? 'error' : variant;

  // Input classes
  const inputClasses = `
    ${baseInputStyles}
    ${sizes[size]}
    ${variants[currentVariant]}
    ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${inputClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <span className="text-gray-400">
              {icon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={props.name || inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className={`text-red-600 text-sm mt-1 flex items-center ${errorClassName}`}>
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={`text-gray-500 text-sm mt-1 ${helperClassName}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
