// Cache utility functions for consistent cache management

/**
 * Clear all gallery-related cache
 */
export const clearAllGalleryCache = () => {
  console.log('🧹 Clearing all gallery cache...');
  
  // Clear global gallery cache
  if (typeof window !== 'undefined') {
    if (window.__GALLERY_CACHE__) {
      window.__GALLERY_CACHE__.clear();
    }
    if (window.__ADMIN_GALLERY_CACHE__) {
      window.__ADMIN_GALLERY_CACHE__ = [];
    }
  }
  
  // Clear localStorage gallery cache
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('gallery_') || key.includes('gallery')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear localStorage cache:', error);
  }
  
  console.log('✅ All gallery cache cleared');
};

/**
 * Clear specific gallery cache by key
 */
export const clearGalleryCacheByKey = (cacheKey) => {
  console.log(`🧹 Clearing gallery cache: ${cacheKey}`);
  
  // Clear from global cache
  if (typeof window !== 'undefined' && window.__GALLERY_CACHE__) {
    window.__GALLERY_CACHE__.delete(cacheKey);
  }
  
  // Clear from localStorage
  try {
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to clear localStorage cache:', error);
  }
};

/**
 * Force refresh all gallery data and clear cache
 */
export const forceRefreshGalleryData = async () => {
  console.log('🔄 Force refreshing gallery data...');
  
  // Clear all cache first
  clearAllGalleryCache();
  
  // Trigger a custom event that components can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gallery-cache-cleared'));
  }
  
  console.log('✅ Gallery data refresh triggered');
};

/**
 * Get cache status for debugging
 */
export const getGalleryCacheStatus = () => {
  const status = {
    globalCache: 0,
    adminCache: 0,
    localStorageKeys: []
  };
  
  if (typeof window !== 'undefined') {
    if (window.__GALLERY_CACHE__) {
      status.globalCache = window.__GALLERY_CACHE__.size;
    }
    if (window.__ADMIN_GALLERY_CACHE__) {
      status.adminCache = Array.isArray(window.__ADMIN_GALLERY_CACHE__) 
        ? window.__ADMIN_GALLERY_CACHE__.length 
        : 0;
    }
  }
  
  try {
    const keys = Object.keys(localStorage);
    status.localStorageKeys = keys.filter(key => 
      key.startsWith('gallery_') || key.includes('gallery')
    );
  } catch (error) {
    console.warn('Failed to check localStorage:', error);
  }
  
  return status;
};

/**
 * Initialize gallery cache system
 */
export const initializeGalleryCache = () => {
  if (typeof window !== 'undefined') {
    // Initialize global caches if not exists
    if (!window.__GALLERY_CACHE__) {
      window.__GALLERY_CACHE__ = new Map();
    }
    if (!window.__ADMIN_GALLERY_CACHE__) {
      window.__ADMIN_GALLERY_CACHE__ = [];
    }
    
    console.log('✅ Gallery cache system initialized');
  }
};

/**
 * Cache gallery data with consistent key format
 */
export const cacheGalleryData = (category, featured, data) => {
  const cacheKey = `gallery_${category}_${featured}`;
  
  if (typeof window !== 'undefined') {
    // Cache in global memory
    if (window.__GALLERY_CACHE__) {
      window.__GALLERY_CACHE__.set(cacheKey, data);
    }
    
    // Cache in localStorage
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
    }
  }
  
  console.log(`✅ Gallery data cached: ${cacheKey} (${data.length} items)`);
};

/**
 * Get cached gallery data with consistent key format
 */
export const getCachedGalleryData = (category, featured) => {
  const cacheKey = `gallery_${category}_${featured}`;
  
  if (typeof window !== 'undefined') {
    // Check global cache first (fastest)
    if (window.__GALLERY_CACHE__ && window.__GALLERY_CACHE__.has(cacheKey)) {
      console.log(`⚡ INSTANT gallery from global cache: ${cacheKey}`);
      return window.__GALLERY_CACHE__.get(cacheKey);
    }
    
    // Check localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedData = JSON.parse(cached);
        // Store in global cache for next access
        if (window.__GALLERY_CACHE__) {
          window.__GALLERY_CACHE__.set(cacheKey, parsedData);
        }
        console.log(`🚀 FAST gallery from localStorage: ${cacheKey}`);
        return parsedData;
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }
  }
  
  return [];
};
