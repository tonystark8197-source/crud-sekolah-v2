import React from 'react';
import { motion } from 'framer-motion';

// Spinner Loading
export const SpinnerLoading = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizes[size]} ${colors[color]} ${className}`}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        >
          <animate
            attributeName="stroke-dasharray"
            dur="2s"
            values="0 31.416;15.708 15.708;0 31.416"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            dur="2s"
            values="0;-15.708;-31.416"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </motion.div>
  );
};

// Dots Loading
export const DotsLoading = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 }
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`flex space-x-1 ${className}`}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={`${sizes[size]} ${colors[color]} rounded-full`}
        />
      ))}
    </motion.div>
  );
};

// Pulse Loading
export const PulseLoading = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  };

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`${sizes[size]} ${colors[color]} rounded-full ${className}`}
    />
  );
};

// Skeleton Loading
export const SkeletonLoading = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded',
  className = '' 
}) => {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`bg-gray-300 ${width} ${height} ${rounded} ${className}`}
    />
  );
};

// Page Loading (Full Screen)
export const PageLoading = ({ message = 'Loading...', color = 'blue' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <SpinnerLoading size="xl" color={color} className="mx-auto mb-4" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-lg"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Button Loading (for buttons)
export const ButtonLoading = ({ size = 'sm', className = '' }) => {
  return (
    <SpinnerLoading 
      size={size} 
      color="white" 
      className={`inline-block ${className}`} 
    />
  );
};

export default {
  Spinner: SpinnerLoading,
  Dots: DotsLoading,
  Pulse: PulseLoading,
  Skeleton: SkeletonLoading,
  Page: PageLoading,
  Button: ButtonLoading
};
