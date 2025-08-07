import { useState, useEffect } from 'react';
import { preloadLogo } from './useLogoCache';
import { fixLogoUrl } from '../utils/logoUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const defaultSettings = {
  schoolName: 'SMA Negeri 1 Jakarta',
  schoolShortName: 'SMAN 1 Jakarta',
  schoolAddress: 'Jl. Pendidikan No. 123, Menteng, Jakarta Pusat, DKI Jakarta 10310',
  schoolPhone: '021-12345678',
  schoolEmail: 'info@sman1jakarta.sch.id',
  schoolWebsite: 'https://www.sman1jakarta.sch.id',
  principalName: 'Dr. Ahmad Suryadi, M.Pd',
  schoolMotto: 'Unggul dalam Prestasi, Berkarakter, dan Berwawasan Global',
  schoolDescription: 'SMA Negeri 1 Jakarta adalah sekolah menengah atas negeri yang berkomitmen untuk memberikan pendidikan berkualitas tinggi dengan mengembangkan potensi akademik dan karakter siswa.',
  logoUrl: 'http://localhost:8000/images/logo/logo-school.png',
  schoolImage: 'http://localhost:8000/images/logo/logo-school.png',
  newsBackgroundColor: '#f8fafc',
  newsBackgroundImage: null,
  keyFeatures: [
    'Akreditasi A',
    'Fasilitas Lengkap',
    'Guru Berkualitas',
    'Teknologi Modern'
  ]
};

export const useSchoolSettings = () => {
  // Initialize with cached data first, then default settings
  const getCachedSettings = () => {
    try {
      const savedSettings = localStorage.getItem('schoolSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const mergedSettings = { ...defaultSettings, ...parsedSettings };

        // Immediately cache logo for instant sidebar display
        if (mergedSettings.logoUrl) {
          window.__LOGO_CACHE__ = mergedSettings.logoUrl;
          localStorage.setItem('__FAST_LOGO__', mergedSettings.logoUrl);
          console.log('🚀 Logo immediately cached for sidebar:', mergedSettings.logoUrl);
        }

        return mergedSettings;
      }
    } catch (error) {
      // Silent error handling
    }

    // Cache default logo too
    if (defaultSettings.logoUrl) {
      window.__LOGO_CACHE__ = defaultSettings.logoUrl;
      localStorage.setItem('__FAST_LOGO__', defaultSettings.logoUrl);
    }

    return defaultSettings;
  };

  const [settings, setSettings] = useState(getCachedSettings());
  const [loading, setLoading] = useState(false); // Start with false since we have cached data
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch settings from API in background
    const fetchSettings = async () => {
      try {
        setError(null);
        // Don't set loading to true since we already have cached data

        const response = await fetch(`${API_BASE_URL}/settings`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const apiSettings = { ...defaultSettings, ...result.data };

          // Try to get current logo from API
          try {
            console.log('🔍 Fetching logo from API...');
            const logoResponse = await fetch(`${API_BASE_URL}/logo/current`);
            const logoResult = await logoResponse.json();

            if (logoResult.success && logoResult.data && logoResult.data.url) {
              const fixedLogoUrl = fixLogoUrl(logoResult.data.url);
              apiSettings.logoUrl = fixedLogoUrl;
              console.log('✅ Logo loaded from API:', fixedLogoUrl);
            } else {
              console.log('⚠️ No logo data in API response:', logoResult);
            }
          } catch (logoError) {
            console.log('❌ Error fetching logo from API:', logoError.message);
          }

          // Only update if settings actually changed
          const currentSettingsStr = JSON.stringify(settings);
          const newSettingsStr = JSON.stringify(apiSettings);

          if (currentSettingsStr !== newSettingsStr) {
            setSettings(apiSettings);

            // Cache in localStorage
            localStorage.setItem('schoolSettings', JSON.stringify(apiSettings));

            // Preload logo for instant display
            if (apiSettings.logoUrl) {
              preloadLogo(apiSettings.logoUrl);
            }
          }

          // Update favicon and page title on initial load with priority system
          if (apiSettings.logoUrl && apiSettings.logoUrl !== 'http://localhost:8000/images/logo/logo-school.png') {
            const favicon = document.getElementById('favicon');
            const appleTouchIcon = document.getElementById('apple-touch-icon');

            // Add timestamp to force refresh
            const timestampedUrl = apiSettings.logoUrl.includes('?')
              ? `${apiSettings.logoUrl}&t=${Date.now()}`
              : `${apiSettings.logoUrl}?t=${Date.now()}`;

            if (favicon) favicon.href = timestampedUrl;
            if (appleTouchIcon) appleTouchIcon.href = timestampedUrl;

            console.log('✅ useSchoolSettings: Favicon updated to:', timestampedUrl);
          }

          // Update title with priority: websiteTitle > schoolShortName > default
          const titleElement = document.getElementById('page-title');
          if (titleElement) {
            if (apiSettings.websiteTitle) {
              // Priority 1: Use websiteTitle from Settings
              document.title = apiSettings.websiteTitle;
              titleElement.textContent = apiSettings.websiteTitle;
              console.log('✅ useSchoolSettings: Title updated from websiteTitle:', apiSettings.websiteTitle);
            } else if (apiSettings.schoolShortName) {
              // Priority 2: Use schoolShortName + suffix
              const formattedTitle = `${apiSettings.schoolShortName} - Sistem Informasi`;
              document.title = formattedTitle;
              titleElement.textContent = formattedTitle;
              console.log('✅ useSchoolSettings: Title updated from schoolShortName:', formattedTitle);
            }
          }
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (err) {
        setError(err.message);
        // Keep using cached settings, don't overwrite them
      }
      // No finally block needed since we don't set loading to false
    };

    fetchSettings();

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      if (event.detail) {
        setSettings({ ...defaultSettings, ...event.detail });
      }
    };

    // Listen for navbar logo updates
    const handleNavbarLogoUpdate = (event) => {
      console.log('🔄 useSchoolSettings: Navbar logo update received:', event.detail.logoUrl);
      setSettings(prev => {
        const updatedSettings = {
          ...prev,
          logoUrl: event.detail.logoUrl
        };
        localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
        console.log('📦 Settings updated in useSchoolSettings:', updatedSettings);

        return updatedSettings;
      });
    };

    // Listen for general logo updates
    const handleLogoUpdate = (event) => {
      console.log('🔄 useSchoolSettings: General logo update received:', event.detail?.logoUrl);
      if (event.detail?.logoUrl) {
        setSettings(prev => {
          const updatedSettings = {
            ...prev,
            logoUrl: event.detail.logoUrl
          };
          localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
          return updatedSettings;
        });
      }
    };

    window.addEventListener('schoolSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('navbarLogoUpdated', handleNavbarLogoUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);

    console.log('🎧 useSchoolSettings: Event listeners added');

    return () => {
      window.removeEventListener('schoolSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('navbarLogoUpdated', handleNavbarLogoUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      console.log('🧹 useSchoolSettings: Event listeners removed');
    };
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('schoolSettingsUpdated', { 
      detail: updatedSettings 
    }));
  };

  return {
    settings,
    loading,
    error,
    updateSettings
  };
};

export default useSchoolSettings;
