import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/placeholder.svg',
  onError,
  onLoad,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);

    if (e.target.src !== fallbackSrc) {
      e.target.onerror = null;
      e.target.src = fallbackSrc;
    }

    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
    setIsLoading(false);

    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <div className="relative">
      {isLoading && !hasError && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded ${className}`}>
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
