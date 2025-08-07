import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = false,
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white transition-all duration-300';

  // Variant styles
  const variants = {
    default: '',
    primary: 'border-l-4 border-blue-500',
    success: 'border-l-4 border-green-500',
    warning: 'border-l-4 border-yellow-500',
    danger: 'border-l-4 border-red-500',
    info: 'border-l-4 border-cyan-500'
  };

  // Padding styles
  const paddings = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Shadow styles
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  // Rounded styles
  const roundeds = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  // Border styles
  const borderStyles = border ? 'border border-gray-200' : '';

  // Hover styles
  const hoverStyles = hover ? 'hover:shadow-lg cursor-pointer' : '';

  // Combine classes
  const cardClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${paddings[padding]}
    ${shadows[shadow]}
    ${roundeds[rounded]}
    ${borderStyles}
    ${hoverStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? {
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Card Header component
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Body component
const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Card Footer component
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Title component
const CardTitle = ({ children, size = 'lg', className = '', ...props }) => {
  const sizes = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-semibold',
    xl: 'text-xl font-bold',
    '2xl': 'text-2xl font-bold'
  };

  return (
    <h3 className={`text-gray-900 ${sizes[size]} ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Card Description component
const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-gray-600 text-sm ${className}`} {...props}>
      {children}
    </p>
  );
};

// Export all components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
