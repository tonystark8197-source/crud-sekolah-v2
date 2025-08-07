import React from 'react';

const ToggleSwitch = ({
  id,
  checked = false,
  onChange,
  disabled = false,
  theme = 'light',
  label,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  // Generate unique ID if not provided
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`toggle-switch ${theme} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <input
          className="toggle-input"
          id={toggleId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <label className="toggle-label" htmlFor={toggleId}></label>
      </div>
      {label && (
        <label
          htmlFor={toggleId}
          className={`text-sm font-medium text-gray-700 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default ToggleSwitch;
