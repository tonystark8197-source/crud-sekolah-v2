import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../ui';
import { FadeIn } from '../ui/AnimatedComponents';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

// Get cached theme settings
const getCachedThemeSettings = () => {
  try {
    const cached = localStorage.getItem('themeSettings');
    if (cached) {
      const parsedData = JSON.parse(cached);
      console.log('📦 Using cached theme settings:', parsedData);
      return {
        headerBg: parsedData.headerBg || '#1e3a8a',
        headerText: parsedData.headerText || '#ffffff',
        headerAccent: parsedData.headerAccent || '#3b82f6',
        topNavBg: parsedData.topNavBg || '#2563eb',
        topNavText: parsedData.topNavText || '#ffffff',
        topNavIconColor: parsedData.topNavIconColor || '#e5e7eb',
        navbarBg: parsedData.navbarBg || '#2563eb',
        navbarText: parsedData.navbarText || '#ffffff',
        navbarHover: parsedData.navbarHover || '#3b82f6',
        mainNavBg: parsedData.mainNavBg || '#2563eb',
        mainNavText: parsedData.mainNavText || '#ffffff',
        mainNavHover: parsedData.mainNavHover || '#3b82f6',
        socialMedia: parsedData.socialMedia || {
          instagram: 'https://instagram.com',
          youtube: 'https://youtube.com',
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com'
        }
      };
    }
  } catch (error) {
    console.warn('Failed to parse cached theme settings:', error);
  }

  // Default settings if no cache
  return {
    headerBg: '#1e3a8a',
    headerText: '#ffffff',
    headerAccent: '#3b82f6',
    topNavBg: '#2563eb',
    topNavText: '#ffffff',
    topNavIconColor: '#e5e7eb',
    navbarBg: '#2563eb',
    navbarText: '#ffffff',
    navbarHover: '#3b82f6',
    mainNavBg: '#2563eb',
    mainNavText: '#ffffff',
    mainNavHover: '#3b82f6',
    socialMedia: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com'
    }
  };
};

const ThemeSettings = () => {
  const [saving, setSaving] = useState(false);

  // Initialize with cached data immediately - no loading state
  const [themeSettings, setThemeSettings] = useState(() => getCachedThemeSettings());

  // Background loading theme settings - no loading state shown to user
  const loadThemeSettingsInBackground = async () => {
    try {
      console.log('🔄 Loading theme settings in background...');
      const response = await api.get('/theme-settings');
      if (response.data.success) {
        const data = response.data.data;
        const newSettings = {
          headerBg: data.colors.headerBg,
          headerText: data.colors.headerText,
          headerAccent: data.colors.headerAccent,
          topNavBg: data.colors.topNavBg,
          topNavText: data.colors.topNavText,
          topNavIconColor: data.colors.topNavIconColor,
          navbarBg: data.colors.navbarBg,
          navbarText: data.colors.navbarText,
          navbarHover: data.colors.navbarHover,
          mainNavBg: data.colors.mainNavBg,
          mainNavText: data.colors.mainNavText,
          mainNavHover: data.colors.mainNavHover,
          socialMedia: data.socialMedia
        };

        // Update state and cache
        setThemeSettings(newSettings);
        localStorage.setItem('themeSettings', JSON.stringify(newSettings));
        console.log('✅ Theme settings updated and cached');
      }
    } catch (error) {
      console.error('Background loading failed:', error);
      // Don't show error to user, just keep cached data
    }
  };

  // Save theme settings
  const saveThemeSettings = async () => {
    try {
      setSaving(true);

      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang menyimpan pengaturan tema',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.post('/admin/theme/update', themeSettings);

      if (response.data.success) {
        // Clear old cache first
        localStorage.removeItem('themeSettings');

        // Update localStorage dengan data terbaru
        localStorage.setItem('themeSettings', JSON.stringify(themeSettings));

        // Dispatch multiple events untuk memastikan semua komponen terupdate
        window.dispatchEvent(new CustomEvent('themeUpdated', {
          detail: themeSettings
        }));

        // Dispatch storage event untuk cross-component communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'themeSettings',
          newValue: JSON.stringify(themeSettings),
          oldValue: null
        }));

        // Force reload navbar theme
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('forceThemeReload'));
        }, 100);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pengaturan tema berhasil disimpan',
          confirmButtonColor: '#3B82F6',
          timer: 1500,
          showConfirmButton: false
        });

      } else {
        throw new Error(response.data.message || 'Gagal menyimpan pengaturan tema');
      }
    } catch (error) {
      console.error('Error saving theme settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.message || 'Terjadi kesalahan saat menyimpan pengaturan tema.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setThemeSettings(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setThemeSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  useEffect(() => {
    // Load theme settings in background after component mounts
    const timer = setTimeout(loadThemeSettingsInBackground, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FadeIn>
      <Card padding="lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pengaturan Tema</h2>
            <p className="text-gray-600">Sesuaikan warna navbar dan elemen website</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Header Colors */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-crown mr-2 text-purple-600"></i>
              Header
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.headerBg}
                    onChange={(e) => handleInputChange('headerBg', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.headerBg}
                    onChange={(e) => handleInputChange('headerBg', e.target.value)}
                    placeholder="#1e3a8a"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.headerText}
                    onChange={(e) => handleInputChange('headerText', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.headerText}
                    onChange={(e) => handleInputChange('headerText', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.headerAccent}
                    onChange={(e) => handleInputChange('headerAccent', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.headerAccent}
                    onChange={(e) => handleInputChange('headerAccent', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Navigation Colors */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-bars mr-2 text-blue-600"></i>
              Top Navigation Bar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.topNavBg}
                    onChange={(e) => handleInputChange('topNavBg', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.topNavBg}
                    onChange={(e) => handleInputChange('topNavBg', e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.topNavText}
                    onChange={(e) => handleInputChange('topNavText', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.topNavText}
                    onChange={(e) => handleInputChange('topNavText', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.topNavIconColor}
                    onChange={(e) => handleInputChange('topNavIconColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.topNavIconColor}
                    onChange={(e) => handleInputChange('topNavIconColor', e.target.value)}
                    placeholder="#e5e7eb"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navbar Colors */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-compass mr-2 text-green-600"></i>
              Navbar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.navbarBg}
                    onChange={(e) => handleInputChange('navbarBg', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.navbarBg}
                    onChange={(e) => handleInputChange('navbarBg', e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.navbarText}
                    onChange={(e) => handleInputChange('navbarText', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.navbarText}
                    onChange={(e) => handleInputChange('navbarText', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hover Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.navbarHover}
                    onChange={(e) => handleInputChange('navbarHover', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.navbarHover}
                    onChange={(e) => handleInputChange('navbarHover', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Theme */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-sidebar mr-2 text-purple-600"></i>
              Sidebar Theme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.mainNavBg}
                    onChange={(e) => handleInputChange('mainNavBg', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.mainNavBg}
                    onChange={(e) => handleInputChange('mainNavBg', e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.mainNavText}
                    onChange={(e) => handleInputChange('mainNavText', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.mainNavText}
                    onChange={(e) => handleInputChange('mainNavText', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hover Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.mainNavHover}
                    onChange={(e) => handleInputChange('mainNavHover', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={themeSettings.mainNavHover}
                    onChange={(e) => handleInputChange('mainNavHover', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={saveThemeSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default ThemeSettings;
