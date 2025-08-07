import { useState, useEffect } from 'react';
import { fixLogoUrl, DEFAULT_LOGO_PATH } from '../utils/logoUtils';
import { getCachedLogo } from '../hooks/useLogoCache';

/**
 * Reusable Logo Image Component
 * Handles logo loading with fallback and error handling
 */
const LogoImage = ({
  src,
  alt = 'Logo Sekolah',
  className = 'h-10 w-10 object-contain',
  style = {},
  onLoad,
  onError,
  fallbackSrc = DEFAULT_LOGO_PATH,
  showLoadingState = false,
  loadingClassName = 'animate-pulse bg-gray-200',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Update src when prop changes with instant caching
  useEffect(() => {
    if (src) {
      const fixedSrc = fixLogoUrl(src);

      // Try to get cached version first for instant display
      const cachedSrc = getCachedLogo(fixedSrc);
      if (cachedSrc && cachedSrc !== fixedSrc) {
        // Use cached version immediately
        setCurrentSrc(cachedSrc);
        setIsLoading(false);
        setHasError(false);
        setRetryCount(0);
      } else {
        // Use fixed src directly for immediate display
        setCurrentSrc(fixedSrc);
        setIsLoading(false);
        setHasError(false);
        setRetryCount(0);
      }
    } else {
      // If no src provided, use fallback immediately
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(false);
    }
  }, [src, fallbackSrc]);

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);

    // Ensure immediate visibility
    e.target.style.opacity = '1';
    e.target.style.visibility = 'visible';

    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);

    // Prevent infinite loop
    e.target.onerror = null;

    // Use fallback if not already using it
    if (e.target.src !== fallbackSrc && retryCount < 2) {
      e.target.src = fallbackSrc;
      setCurrentSrc(fallbackSrc);
      setRetryCount(prev => prev + 1);
    }

    if (onError) {
      onError(e);
    }
  };

  const defaultStyle = {
    transition: 'none', // No transition for instant display
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    opacity: 1, // Always visible
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'auto',
    imageRendering: 'auto',
    ...style
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={defaultStyle}
      loading="eager"
      fetchPriority="high"
      decoding="sync"
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default LogoImage;
