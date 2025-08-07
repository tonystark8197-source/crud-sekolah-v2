/**
 * Utility functions for handling image URLs
 */

/**
 * Fix image URL to use backend Laravel public folder
 * @param {string} url - Original image URL
 * @param {string} type - Image type: 'news', 'gallery', 'logo'
 * @returns {string} - Fixed URL
 */
export const fixImageUrl = (url, type = 'news') => {
  if (!url) return null;
  
  console.log(`🔧 Fixing ${type} image URL:`, url);
  
  // If URL already has localhost:8000/images, return as is
  if (url.includes('localhost:8000/images/')) {
    console.log('✅ URL already correct:', url);
    return url;
  }
  
  // Extract filename from various URL formats
  const filename = url.split('/').pop();
  
  // Fix storage paths to backend Laravel public path
  if (url.includes('/storage/')) {
    const fixedUrl = `http://localhost:8000/images/${type}/${filename}`;
    console.log(`🔄 Fixed storage URL:`, url, '->', fixedUrl);
    return fixedUrl;
  }
  
  // Fix uploads paths
  if (url.includes('/uploads/images/')) {
    const fixedUrl = `http://localhost:8000/images/${type}/${filename}`;
    console.log(`🔄 Fixed uploads URL:`, url, '->', fixedUrl);
    return fixedUrl;
  }
  
  // Fix relative paths
  if (url.startsWith('/images/')) {
    const fixedUrl = `http://localhost:8000${url}`;
    console.log(`🔄 Fixed relative URL:`, url, '->', fixedUrl);
    return fixedUrl;
  }
  
  // If URL starts with localhost:8000 but different path, return as is
  if (url.includes('localhost:8000')) {
    console.log('✅ URL has localhost:8000, keeping as is:', url);
    return url;
  }
  
  // Default: assume it's a filename and construct full URL
  const fixedUrl = `http://localhost:8000/images/${type}/${filename}`;
  console.log(`🔄 Constructed URL from filename:`, url, '->', fixedUrl);
  return fixedUrl;
};

/**
 * Fix news image URL
 * @param {string} url - Original news image URL
 * @returns {string} - Fixed URL
 */
export const fixNewsImageUrl = (url) => {
  return fixImageUrl(url, 'news');
};

/**
 * Fix gallery image URL
 * @param {string} url - Original gallery image URL
 * @returns {string} - Fixed URL
 */
export const fixGalleryImageUrl = (url) => {
  return fixImageUrl(url, 'gallery');
};

/**
 * Fix logo image URL
 * @param {string} url - Original logo image URL
 * @returns {string} - Fixed URL
 */
export const fixLogoImageUrl = (url) => {
  return fixImageUrl(url, 'logo');
};

/**
 * Get image URL with fallback
 * @param {string} url - Original image URL
 * @param {string} type - Image type
 * @param {string} fallback - Fallback image URL
 * @returns {string} - Image URL with fallback
 */
export const getImageUrlWithFallback = (url, type = 'news', fallback = null) => {
  if (!url) return fallback;
  
  const fixedUrl = fixImageUrl(url, type);
  return fixedUrl || fallback;
};

/**
 * Create image component props with error handling
 * @param {string} url - Original image URL
 * @param {string} type - Image type
 * @param {string} alt - Alt text
 * @param {string} fallback - Fallback image URL
 * @returns {Object} - Props for img element
 */
export const createImageProps = (url, type = 'news', alt = '', fallback = null) => {
  const fixedUrl = getImageUrlWithFallback(url, type, fallback);
  
  return {
    src: fixedUrl,
    alt,
    onError: (e) => {
      console.log(`❌ Image load error for ${type}:`, e.target.src);
      if (fallback && e.target.src !== fallback) {
        console.log(`🔄 Using fallback:`, fallback);
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = fallback;
      }
    },
    onLoad: (e) => {
      console.log(`✅ Image loaded successfully for ${type}:`, e.target.src);
    }
  };
};

/**
 * Validate image URL accessibility
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} - Whether image is accessible
 */
export const validateImageUrl = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log(`❌ Image validation failed:`, url, error.message);
    return false;
  }
};

/**
 * Preload image
 * @param {string} url - Image URL to preload
 * @returns {Promise<boolean>} - Whether preload was successful
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Image preloaded:`, url);
      resolve(true);
    };
    img.onerror = () => {
      console.log(`❌ Image preload failed:`, url);
      resolve(false);
    };
    img.src = url;
  });
};
