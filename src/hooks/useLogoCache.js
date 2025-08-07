import { useEffect, useCallback } from 'react';

// Global logo cache
const logoCache = new Map();
const logoBlobCache = new Map();

// Preload logo when app starts
export const preloadLogo = async (logoUrl) => {
  if (!logoUrl || logoCache.has(logoUrl)) return;

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(logoUrl, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'default'
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Cache in memory
      logoBlobCache.set(logoUrl, blob);
      logoCache.set(logoUrl, blobUrl);

      // Cache in localStorage (with quota handling)
      try {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            localStorage.setItem(`logo_${btoa(logoUrl)}`, reader.result);
          } catch {
            // Silent fail for quota exceeded
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // Silent fail for reader errors
      }
    } else {
      // Cache original URL for fallback
      logoCache.set(logoUrl, logoUrl);
    }
  } catch (error) {
    // Silent fail - just cache the original URL
    logoCache.set(logoUrl, logoUrl);

    // Only log if it's not an abort error (timeout)
    if (error.name !== 'AbortError') {
      console.debug('Logo preload failed, using original URL:', logoUrl);
    }
  }
};

// Get cached logo URL
export const getCachedLogo = (logoUrl) => {
  if (!logoUrl) return null;

  // Check memory cache
  if (logoCache.has(logoUrl)) {
    return logoCache.get(logoUrl);
  }

  // Check localStorage
  try {
    const cached = localStorage.getItem(`logo_${btoa(logoUrl)}`);
    if (cached) {
      logoCache.set(logoUrl, cached);
      return cached;
    }
  } catch {
    // Ignore localStorage errors
  }

  // Start preloading
  preloadLogo(logoUrl);
  return logoUrl;
};

// Hook for logo caching
export const useLogoCache = (logoUrl) => {
  const preloadLogoCallback = useCallback(async (url) => {
    await preloadLogo(url);
  }, []);
  
  useEffect(() => {
    if (logoUrl) {
      preloadLogoCallback(logoUrl);
    }
  }, [logoUrl, preloadLogoCallback]);
  
  return getCachedLogo(logoUrl);
};

// Cleanup function
export const cleanupLogoCache = () => {
  logoCache.forEach((blobUrl) => {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  });
  logoCache.clear();
  logoBlobCache.clear();
};

// Auto cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupLogoCache);
}
