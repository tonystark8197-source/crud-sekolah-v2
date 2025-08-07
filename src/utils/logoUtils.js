/**
 * Utility functions for handling school logo operations with database
 */

import { api } from '../services/api';

// Default logo path (use local fallback to avoid CORS issues)
export const DEFAULT_LOGO_PATH = '/images/logo-default.png';

// Logo upload folder path - consistent with gallery structure
export const LOGO_UPLOAD_PATH = '/uploads/images/logo/';

/**
 * Validate uploaded logo file
 * @param {File} file - The uploaded file
 * @returns {Object} - Validation result with success and message
 */
export const validateLogoFile = (file) => {
  if (!file) {
    return { success: false, message: 'Tidak ada file yang dipilih' };
  }

  console.log('Validating logo file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    console.error('File type not allowed:', file.type, 'Allowed types:', allowedTypes);
    return {
      success: false,
      message: `Tipe file tidak didukung (${file.type}). Gunakan format: JPG, JPEG, PNG, atau WebP`
    };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      message: 'Ukuran file terlalu besar. Maksimal 5MB'
    };
  }

  return { success: true, message: 'File valid' };
};

/**
 * Generate unique filename for logo
 * @param {File} file - The uploaded file
 * @returns {string} - Unique filename
 */
export const generateLogoFilename = (file) => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  return `school-logo-${timestamp}.${extension}`;
};

/**
 * Create preview URL for uploaded file
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} - Preview URL
 */
export const createLogoPreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload logo to database via API
 * @param {File} file - The uploaded file
 * @param {string} description - Optional description
 * @returns {Promise<Object>} - The upload result
 */
export const uploadLogoToDatabase = async (file, description = '') => {
  try {
    // Validate file first
    const validation = validateLogoFile(file);
    if (!validation.success) {
      throw new Error(validation.message);
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('logo', file);
    if (description) {
      formData.append('description', description);
    }

    // Upload to API
    const response = await api.post('/logo/upload', formData);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }

  } catch (error) {
    console.error('Error uploading logo:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Gagal mengupload logo'
    };
  }
};

/**
 * Get current active logo from database
 * @returns {Promise<Object|null>} - Current logo data or null
 */
export const getCurrentLogo = async () => {
  try {
    console.log('Fetching current logo from API...');
    const response = await api.get('/logo/current');
    console.log('Current logo API response:', response.data);

    if (response.data.success) {
      const logoData = response.data.data;
      console.log('Current logo data:', logoData);
      return logoData;
    }

    console.log('No current logo found');
    return null;
  } catch (error) {
    console.error('Error getting current logo:', error);
    return null;
  }
};

/**
 * Get latest uploaded logo from database
 * @returns {Promise<Object|null>} - Latest logo data or null
 */
export const getLatestLogo = async () => {
  try {
    const response = await api.get('/logo/current');

    if (response.data.success) {
      return response.data.data;
    }

    return null;
  } catch {
    // Return null to use fallback logo
    return null;
  }
};

/**
 * Get all logos from database
 * @returns {Promise<Array>} - Array of all logos
 */
export const getAllLogos = async () => {
  try {
    const response = await api.get('/logo/all');

    if (response.data.success) {
      return response.data.data;
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Delete logo from database
 * @param {number} logoId - ID of logo to delete
 * @returns {Promise<Object>} - Delete result
 */
export const deleteLogo = async (logoId) => {
  try {
    const response = await api.delete(`/logos/${logoId}`);

    if (response.data.success) {
      // Clear cache
      sessionStorage.removeItem('cachedLogoUrl');
      return {
        success: true,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Delete failed');
  } catch (error) {
    console.error('Error deleting logo:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Gagal menghapus logo'
    };
  }
};

/**
 * Set logo as active
 * @param {number} logoId - ID of logo to set as active
 * @returns {Promise<Object>} - Result
 */
export const setActiveLogo = async (logoId) => {
  try {
    const response = await api.put(`/logos/${logoId}/activate`);

    if (response.data.success) {
      // Clear cache to force refresh
      sessionStorage.removeItem('cachedLogoUrl');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Failed to set active');
  } catch (error) {
    console.error('Error setting active logo:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Gagal mengatur logo aktif'
    };
  }
};

/**
 * Get logo URL for display (sync version with fallback)
 * @returns {string} - Logo URL to display immediately
 */
export const getLogoUrl = () => {
  // Return cached URL immediately for instant display
  const cachedUrl = sessionStorage.getItem('cachedLogoUrl');
  if (cachedUrl && cachedUrl !== DEFAULT_LOGO_PATH) {
    console.log('📦 Using cached logo URL:', cachedUrl);
    return cachedUrl;
  }

  console.log('🔄 Using default logo URL:', DEFAULT_LOGO_PATH);
  // Return default logo immediately to prevent flickering
  return DEFAULT_LOGO_PATH;
};

/**
 * Get logo URL for display (async version for database)
 * @returns {Promise<string>} - Logo URL to display
 */
export const getLogoUrlAsync = async () => {
  try {
    // Try to get from cache first for immediate display
    const cachedUrl = sessionStorage.getItem('cachedLogoUrl');
    if (cachedUrl && cachedUrl !== DEFAULT_LOGO_PATH) {
      // Return cached URL immediately, but also refresh in background
      refreshLogoCache();
      return cachedUrl;
    }

    // Get latest logo from database
    const latestLogo = await getLatestLogo();
    if (latestLogo && latestLogo.url) {
      // Ensure URL is properly formatted
      const logoUrl = fixLogoUrl(latestLogo.url);
      sessionStorage.setItem('cachedLogoUrl', logoUrl);
      return logoUrl;
    }

    // Fallback to current logo
    const currentLogo = await getCurrentLogo();
    if (currentLogo && currentLogo.url) {
      // Ensure URL is properly formatted
      const logoUrl = fixLogoUrl(currentLogo.url);
      sessionStorage.setItem('cachedLogoUrl', logoUrl);
      return logoUrl;
    }

    // Final fallback to default logo
    return DEFAULT_LOGO_PATH;
  } catch (error) {
    console.error('Error getting logo URL:', error);

    // Try cache as fallback
    const cachedUrl = sessionStorage.getItem('cachedLogoUrl');
    if (cachedUrl) {
      return cachedUrl;
    }

    return DEFAULT_LOGO_PATH;
  }
};

/**
 * Fix logo URL format (ensure correct backend URL)
 * @param {string} url - Original URL
 * @returns {string} - Fixed URL
 */
export const fixLogoUrl = (url) => {
  if (!url) return DEFAULT_LOGO_PATH;

  console.log('🔧 Fixing logo URL:', url);

  // If URL already has localhost:8000/images/logo, keep as is
  if (url.includes('localhost:8000/images/logo/')) {
    console.log('✅ URL is backend absolute path:', url);
    return url;
  }

  // If URL starts with /images/logo/ (relative path), convert to backend absolute URL
  if (url.startsWith('/images/logo/')) {
    const backendUrl = `http://localhost:8000${url}`;
    console.log('🔄 Converting relative to backend absolute:', url, '->', backendUrl);
    return backendUrl;
  }

  // If URL is just a filename, assume it's in the logo directory
  if (!url.includes('/') && (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.webp') || url.includes('.svg'))) {
    const backendUrl = `http://localhost:8000/images/logo/${url}`;
    console.log('🔄 Converting filename to backend absolute:', url, '->', backendUrl);
    return backendUrl;
  }

  // Fix storage path to backend absolute URL
  if (url.includes('/storage/logos/')) {
    const filename = url.split('/').pop();
    const fixedUrl = `http://localhost:8000/images/logo/${filename}`;
    console.log('🔄 Fixed storage/logos URL:', url, '->', fixedUrl);
    return fixedUrl;
  }

  if (url.includes('/storage/')) {
    const filename = url.split('/').pop();
    const fixedUrl = `http://localhost:8000/images/logo/${filename}`;
    console.log('🔄 Fixed storage URL:', url, '->', fixedUrl);
    return fixedUrl;
  }

  if (url.includes('/uploads/images/logo/')) {
    const filename = url.split('/').pop();
    const fixedUrl = `http://localhost:8000/images/logo/${filename}`;
    console.log('🔄 Fixed uploads URL:', url, '->', fixedUrl);
    return fixedUrl;
  }

  // If URL starts with localhost:8000 but different path, return as is
  if (url.includes('localhost:8000')) {
    console.log('✅ URL has localhost:8000, keeping as is:', url);
    return url;
  }

  console.log('⚠️ URL format not recognized, returning default:', url);
  return DEFAULT_LOGO_PATH;
};

/**
 * Clear logo cache and force refresh
 */
export const clearLogoCache = () => {
  console.log('🧹 Clearing logo cache...');
  sessionStorage.removeItem('cachedLogoUrl');
  localStorage.removeItem('schoolSettings');

  // Dispatch event to trigger refresh
  window.dispatchEvent(new CustomEvent('logoCacheCleared'));
};

/**
 * Refresh logo cache in background
 */
const refreshLogoCache = async () => {
  try {
    console.log('🔄 Refreshing logo cache...');
    const latestLogo = await getLatestLogo();
    if (latestLogo && latestLogo.url) {
      const fixedUrl = fixLogoUrl(latestLogo.url);
      sessionStorage.setItem('cachedLogoUrl', fixedUrl);
      console.log('✅ Logo cache refreshed:', fixedUrl);

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('logoUpdated', {
        detail: { logoUrl: fixedUrl }
      }));
    }
  } catch (error) {
    console.error('❌ Error refreshing logo cache:', error);
  }
};

/**
 * Get all logo files from database
 * @returns {Promise<Array>} - Array of logo file information
 */
export const getLogoFilesFromDatabase = async () => {
  try {
    const logos = await getAllLogos();

    // Add default logo to the list
    const defaultLogoInfo = {
      id: 'default',
      filename: 'logo-school.png',
      original_name: 'logo-school.png',
      url: DEFAULT_LOGO_PATH,
      file_size: 0,
      formatted_size: '0 KB',
      mime_type: 'image/png',
      uploaded_at: '2024-01-01 00:00:00',
      is_active: logos.length === 0, // Default is active if no logos exist
      isDefault: true
    };

    return [defaultLogoInfo, ...logos];
  } catch (error) {
    console.error('Error getting logos from database:', error);
    return [{
      id: 'default',
      filename: 'logo-school.png',
      original_name: 'logo-school.png',
      url: DEFAULT_LOGO_PATH,
      file_size: 0,
      formatted_size: '0 KB',
      mime_type: 'image/png',
      uploaded_at: '2024-01-01 00:00:00',
      is_active: true,
      isDefault: true
    }];
  }
};

/**
 * Update favicon with logo URL
 * @param {string} logoUrl - Logo URL to use as favicon
 */
export const updateFavicon = (logoUrl) => {
  try {
    console.log('Updating favicon to:', logoUrl);

    // Add timestamp to force browser refresh
    const timestampedUrl = logoUrl.includes('?')
      ? `${logoUrl}&t=${Date.now()}`
      : `${logoUrl}?t=${Date.now()}`;

    // Update existing favicon elements by ID (from index.html)
    const favicon = document.getElementById('favicon');
    const appleTouchIcon = document.getElementById('apple-touch-icon');

    if (favicon) {
      favicon.href = timestampedUrl;
      console.log('Main favicon updated to:', timestampedUrl);
    } else {
      console.log('Favicon element not found, creating new one');
      const newFavicon = document.createElement('link');
      newFavicon.id = 'favicon';
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = timestampedUrl;
      document.head.appendChild(newFavicon);
    }

    if (appleTouchIcon) {
      appleTouchIcon.href = timestampedUrl;
      console.log('Apple touch icon updated to:', timestampedUrl);
    } else {
      console.log('Apple touch icon not found, creating new one');
      const newAppleTouchIcon = document.createElement('link');
      newAppleTouchIcon.id = 'apple-touch-icon';
      newAppleTouchIcon.rel = 'apple-touch-icon';
      newAppleTouchIcon.href = timestampedUrl;
      document.head.appendChild(newAppleTouchIcon);
    }

    // Fallback: create new favicon if IDs not found
    if (!favicon && !appleTouchIcon) {
      const newFavicon = document.createElement('link');
      newFavicon.id = 'favicon';
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = timestampedUrl;
      document.head.appendChild(newFavicon);
      console.log('New favicon created and updated to:', timestampedUrl);
    }

    // Force browser to refresh favicon by removing and re-adding
    setTimeout(() => {
      const currentFavicon = document.getElementById('favicon');
      if (currentFavicon) {
        const parent = currentFavicon.parentNode;
        parent.removeChild(currentFavicon);

        const newFavicon = document.createElement('link');
        newFavicon.id = 'favicon';
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/png';
        newFavicon.href = timestampedUrl;
        parent.appendChild(newFavicon);
        console.log('Favicon force refreshed');
      }
    }, 100);

  } catch (error) {
    console.error('Error updating favicon:', error);
  }
};

/**
 * Update page title with school name
 * @param {string} schoolName - School name to use in title
 */
export const updatePageTitle = (schoolName) => {
  try {
    const title = document.getElementById('page-title');
    if (title && schoolName) {
      title.textContent = `${schoolName} - Sistem Informasi`;
      console.log('Page title updated to:', title.textContent);
    }
  } catch (error) {
    console.error('Error updating page title:', error);
  }
};

/**
 * Update navbar logo across the application
 * @param {string} logoUrl - Logo URL to use in navbar
 */
export const updateNavbarLogo = (logoUrl) => {
  try {
    console.log('📡 Dispatching navbar logo update events:', logoUrl);

    // Dispatch custom event for navbar logo update
    window.dispatchEvent(new CustomEvent('navbarLogoUpdated', {
      detail: { logoUrl }
    }));

    // Also dispatch general settings update for navbar refresh
    window.dispatchEvent(new CustomEvent('schoolSettingsUpdated', {
      detail: { logoUrl }
    }));

    // Dispatch storage event to trigger useSchoolSettings refresh
    window.dispatchEvent(new CustomEvent('storage', {
      detail: { key: 'schoolSettings' }
    }));

    // Force refresh by triggering a logo update event
    window.dispatchEvent(new CustomEvent('logoUpdated', {
      detail: { logoUrl }
    }));

    console.log('✅ All navbar logo update events dispatched');
  } catch (error) {
    console.error('❌ Error updating navbar logo:', error);
  }
};

/**
 * Update logo and school info everywhere
 * @param {string} logoUrl - Logo URL to use for favicon and navbar
 * @param {Object} schoolSettings - School settings object
 */
export const updateLogoEverywhere = (logoUrl, schoolSettings = null) => {
  console.log('🔄 Updating logo everywhere:', logoUrl);

  // Update favicon
  updateFavicon(logoUrl);

  // Update navbar logo
  updateNavbarLogo(logoUrl);

  // Update page title if school settings provided
  if (schoolSettings && schoolSettings.schoolShortName) {
    updatePageTitle(schoolSettings.schoolShortName);
  }

  // Cache the logo URL and settings
  sessionStorage.setItem('cachedLogoUrl', logoUrl);
  if (schoolSettings) {
    const updatedSettings = { ...schoolSettings, logoUrl };
    localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
    console.log('📦 Settings cached:', updatedSettings);
  }

  // Force refresh all components by dispatching multiple events
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('logoUpdated'));
    window.dispatchEvent(new CustomEvent('storage', {
      detail: { key: 'schoolSettings', newValue: JSON.stringify(schoolSettings) }
    }));

    // Force favicon refresh by reloading the page after a short delay
    setTimeout(() => {
      console.log('🔄 Force refreshing favicon...');
      const favicon = document.getElementById('favicon');
      if (favicon) {
        const timestampedUrl = logoUrl.includes('?')
          ? `${logoUrl}&t=${Date.now()}`
          : `${logoUrl}?t=${Date.now()}`;
        favicon.href = timestampedUrl;
      }
    }, 200);
  }, 100);

  console.log('Logo and school info updated everywhere:', {
    logoUrl,
    schoolName: schoolSettings?.schoolShortName
  });
};

/**
 * Preload logo to prevent flickering (async version)
 * @returns {Promise<string>} - Logo URL
 */
export const preloadLogo = async () => {
  try {
    const logoUrl = await getLogoUrlAsync();

    if (logoUrl === DEFAULT_LOGO_PATH) {
      return logoUrl;
    }

    // Create image element to preload
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(logoUrl);
      img.onerror = () => resolve(DEFAULT_LOGO_PATH);
      img.src = logoUrl;

      // Timeout fallback
      setTimeout(() => resolve(logoUrl), 2000);
    });
  } catch (error) {
    console.error('Error preloading logo:', error);
    return DEFAULT_LOGO_PATH;
  }
};
