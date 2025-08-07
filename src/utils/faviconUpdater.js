/**
 * Favicon Updater Utility
 * Utility untuk memaksa update favicon dengan logo terbaru
 */

import { api } from '../services/api';

/**
 * Force update favicon dengan logo terbaru dari server
 */
export const forceUpdateFavicon = async () => {
  try {
    console.log('🔄 Force updating favicon...');

    // 1. Get latest logo from API
    const response = await api.get('/logo/current');
    
    if (response.data.success && response.data.data) {
      const logoData = response.data.data;
      let logoUrl = logoData.url;

      // 2. Fix URL format if needed
      if (logoUrl.startsWith('storage/')) {
        logoUrl = `http://localhost:8000/${logoUrl}`;
      } else if (logoUrl.startsWith('/storage/')) {
        logoUrl = `http://localhost:8000${logoUrl}`;
      } else if (!logoUrl.startsWith('http')) {
        logoUrl = `http://localhost:8000${logoUrl}`;
      }

      console.log('📍 Latest logo URL:', logoUrl);

      // 3. Force update favicon with timestamp
      const timestamp = Date.now();
      const timestampedUrl = `${logoUrl}?t=${timestamp}&force=1`;

      // 4. Remove existing favicon elements
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      // 5. Create new favicon elements
      const favicon = document.createElement('link');
      favicon.id = 'favicon';
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      favicon.href = timestampedUrl;
      document.head.appendChild(favicon);

      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.id = 'apple-touch-icon';
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = timestampedUrl;
      document.head.appendChild(appleTouchIcon);

      // 6. Update localStorage
      const schoolSettings = JSON.parse(localStorage.getItem('schoolSettings') || '{}');
      schoolSettings.logoUrl = logoUrl;
      localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));

      console.log('✅ Favicon force updated to:', timestampedUrl);
      
      // 7. Show notification
      if (window.showAlert) {
        window.showAlert('Favicon berhasil diperbarui!', 'success');
      }

      return { success: true, logoUrl: timestampedUrl };
    } else {
      throw new Error('No logo data found');
    }
  } catch (error) {
    console.error('❌ Error force updating favicon:', error);
    
    if (window.showAlert) {
      window.showAlert('Gagal memperbarui favicon', 'error');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Clear favicon cache dan reload
 */
export const clearFaviconCache = () => {
  try {
    console.log('🧹 Clearing favicon cache...');

    // Remove all favicon-related elements
    const faviconElements = document.querySelectorAll('link[rel*="icon"]');
    faviconElements.forEach(element => element.remove());

    // Clear localStorage cache
    localStorage.removeItem('schoolSettings');
    sessionStorage.removeItem('cachedLogoUrl');

    // Add default favicon back
    const defaultFavicon = document.createElement('link');
    defaultFavicon.id = 'favicon';
    defaultFavicon.rel = 'icon';
    defaultFavicon.type = 'image/x-icon';
    defaultFavicon.href = '/favicon.ico';
    document.head.appendChild(defaultFavicon);

    console.log('✅ Favicon cache cleared');
    
    if (window.showAlert) {
      window.showAlert('Cache favicon dibersihkan', 'info');
    }

    return true;
  } catch (error) {
    console.error('❌ Error clearing favicon cache:', error);
    return false;
  }
};

/**
 * Get current favicon URL
 */
export const getCurrentFaviconUrl = () => {
  const favicon = document.getElementById('favicon');
  return favicon ? favicon.href : null;
};

/**
 * Check if favicon needs update
 */
export const checkFaviconNeedsUpdate = async () => {
  try {
    const currentFaviconUrl = getCurrentFaviconUrl();
    const response = await api.get('/logo/current');
    
    if (response.data.success && response.data.data) {
      const latestLogoUrl = response.data.data.url;
      
      // Compare URLs (ignore timestamps)
      const currentClean = currentFaviconUrl?.split('?')[0];
      const latestClean = latestLogoUrl?.split('?')[0];
      
      return currentClean !== latestClean;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking favicon update:', error);
    return false;
  }
};

/**
 * Auto-update favicon if needed
 */
export const autoUpdateFavicon = async () => {
  try {
    const needsUpdate = await checkFaviconNeedsUpdate();
    
    if (needsUpdate) {
      console.log('🔄 Favicon needs update, updating...');
      return await forceUpdateFavicon();
    } else {
      console.log('✅ Favicon is up to date');
      return { success: true, message: 'Favicon is up to date' };
    }
  } catch (error) {
    console.error('Error auto-updating favicon:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize favicon updater
 */
export const initFaviconUpdater = () => {
  console.log('🚀 Initializing favicon updater...');

  // Auto-update on page load
  setTimeout(autoUpdateFavicon, 1000);

  // Listen for logo update events
  window.addEventListener('logoUpdated', () => {
    console.log('📡 Logo update event received, updating favicon...');
    setTimeout(forceUpdateFavicon, 500);
  });

  // Listen for school settings updates
  window.addEventListener('schoolSettingsUpdated', (event) => {
    if (event.detail && event.detail.logoUrl) {
      console.log('📡 School settings update received, updating favicon...');
      setTimeout(forceUpdateFavicon, 500);
    }
  });

  console.log('✅ Favicon updater initialized');
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaviconUpdater);
  } else {
    initFaviconUpdater();
  }
}
