import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  placeholder = '',
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  resize = 'vertical',
  variant = 'default',
  className = '',
  labelClassName = '',
  textareaClassName = '',
  errorClassName = '',
  helperClassName = '',
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 11)}`;
  // Base textarea styles
  const baseTextareaStyles = 'block w-full border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 text-sm';

  // Resize styles
  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
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

  // Textarea classes
  const textareaClasses = `
    ${baseTextareaStyles}
    ${variants[currentVariant]}
    ${resizeStyles[resize]}
    ${textareaClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label htmlFor={textareaId} className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        id={textareaId}
        name={props.name || textareaId}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={textareaClasses}
        {...props}
      />

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

Textarea.displayName = 'Textarea';

export default Textarea;
