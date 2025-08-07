import { useState, useEffect } from 'react';
import { DEFAULT_LOGO_PATH } from '../utils/logoUtils';

/**
 * InstantLogo Component
 * Logo yang langsung muncul tanpa delay untuk sidebar dan navbar
 */
const InstantLogo = ({
  className = 'h-10 w-10 object-contain',
  alt = 'Logo Sekolah',
  style = {},
  onLoad,
  onError,
  ...props
}) => {
  // Get logo URL immediately from multiple sources
  const getInstantLogoUrl = () => {
    // 1. Try localStorage (school settings)
    try {
      const schoolSettings = localStorage.getItem('schoolSettings');
      if (schoolSettings) {
        const parsed = JSON.parse(schoolSettings);
        if (parsed.logoUrl && parsed.logoUrl !== 'http://localhost:8000/images/logo/logo-school.png') {
          return parsed.logoUrl;
        }
      }
    } catch (e) {
      // Silent fail
    }

    // 2. Try sessionStorage (cached URL)
    try {
      const cachedUrl = sessionStorage.getItem('cachedLogoUrl');
      if (cachedUrl && cachedUrl !== DEFAULT_LOGO_PATH) {
        return cachedUrl;
      }
    } catch (e) {
      // Silent fail
    }

    // 3. Fallback to default logo
    return DEFAULT_LOGO_PATH;

    // 4. Fallback to default
    return DEFAULT_LOGO_PATH;
  };

  const [logoUrl, setLogoUrl] = useState(getInstantLogoUrl);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Listen for logo updates
  useEffect(() => {
    const handleLogoUpdate = () => {
      const newUrl = getInstantLogoUrl();
      if (newUrl !== logoUrl) {
        setLogoUrl(newUrl);
        setHasError(false);
        setRetryCount(0);
      }
    };

    // Listen for various logo update events
    window.addEventListener('logoUpdated', handleLogoUpdate);
    window.addEventListener('schoolSettingsUpdated', handleLogoUpdate);
    window.addEventListener('storage', handleLogoUpdate);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      window.removeEventListener('schoolSettingsUpdated', handleLogoUpdate);
      window.removeEventListener('storage', handleLogoUpdate);
    };
  }, [logoUrl]);

  const handleLoad = (e) => {
    setHasError(false);
    
    // Ensure immediate visibility
    e.target.style.opacity = '1';
    e.target.style.visibility = 'visible';
    
    console.log('✅ InstantLogo loaded:', logoUrl);
    
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e) => {
    console.warn('❌ InstantLogo error:', logoUrl, 'Retry count:', retryCount);
    
    // Prevent infinite loop
    e.target.onerror = null;
    
    if (retryCount < 3) {
      // Try fallback URLs
      const fallbackUrls = [
        DEFAULT_LOGO_PATH,
        '/images/logo-school.png',
        'http://localhost:8000/images/logo/logo-school.png'
      ];
      
      const nextUrl = fallbackUrls[retryCount];
      if (nextUrl && nextUrl !== logoUrl) {
        setLogoUrl(nextUrl);
        setRetryCount(prev => prev + 1);
        return;
      }
    }
    
    setHasError(true);
    
    if (onError) {
      onError(e);
    }
  };

  const logoStyle = {
    // Optimized for instant display
    transition: 'none',
    opacity: 1,
    visibility: 'visible',
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'auto',
    imageRendering: 'auto',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    ...style
  };

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      style={logoStyle}
      loading="eager"
      fetchPriority="high"
      decoding="sync"
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default InstantLogo;
