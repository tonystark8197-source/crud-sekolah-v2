import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Pilih opsi...',
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  helperClassName = '',
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
  // Base select styles
  const baseSelectStyles = 'block w-full border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white';

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

  // Select classes
  const selectClasses = `
    ${baseSelectStyles}
    ${sizes[size]}
    ${variants[currentVariant]}
    ${selectClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select */}
      <select
        ref={ref}
        id={selectId}
        name={props.name || selectId}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => {
          // Handle both string array and object array
          if (typeof option === 'string') {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          } else {
            return (
              <option key={option.value || index} value={option.value}>
                {option.label}
              </option>
            );
          }
        })}
      </select>

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

Select.displayName = 'Select';

export default Select;
