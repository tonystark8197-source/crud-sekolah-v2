import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../hooks/useSidebar.jsx';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { useAdminAuth, clearAuthTokens } from '../../hooks/useAdminAuth';
import { api } from '../../services/api';
import LogoImage from '../LogoImage';
import LogoutModal from './LogoutModal';
import { getLogoUrl, DEFAULT_LOGO_PATH } from '../../utils/logoUtils';

const Sidebar = () => {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { settings, loading } = useSchoolSettings();
  const { user } = useAdminAuth();
  const [localSettings, setLocalSettings] = useState(settings);

  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    mainNavBg: '#2563eb',
    mainNavText: '#ffffff',
    mainNavHover: '#3b82f6'
  });

  // Load theme settings
  const loadThemeSettings = useCallback(async () => {
    try {
      // First try to get from localStorage (cached)
      const cached = localStorage.getItem('themeSettings');
      if (cached) {
        const parsedSettings = JSON.parse(cached);
        setThemeSettings({
          mainNavBg: parsedSettings.mainNavBg || '#2563eb',
          mainNavText: parsedSettings.mainNavText || '#ffffff',
          mainNavHover: parsedSettings.mainNavHover || '#3b82f6'
        });
        return;
      }

      // If no cache, fetch from API
      const response = await api.get('/admin/theme-settings');
      if (response.data && response.data.success) {
        const settings = response.data.data;
        const themeData = {
          mainNavBg: settings.mainNavBg || '#2563eb',
          mainNavText: settings.mainNavText || '#ffffff',
          mainNavHover: settings.mainNavHover || '#3b82f6'
        };
        setThemeSettings(themeData);
        // Cache the settings
        localStorage.setItem('themeSettings', JSON.stringify(settings));
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
      // Use default colors if loading fails
    }
  }, []);

  // Ultra-fast logo cache - always instant
  const [logoUrl, setLogoUrl] = useState(() => {
    // INSTANT: Check global cache first (fastest possible)
    if (window.__LOGO_CACHE__) {
      console.log('⚡ INSTANT logo from global cache');
      return window.__LOGO_CACHE__;
    }

    // FAST: Check localStorage immediately
    try {
      const fastCache = localStorage.getItem('__FAST_LOGO__');
      if (fastCache && fastCache !== 'undefined' && fastCache !== 'null') {
        window.__LOGO_CACHE__ = fastCache;
        console.log('🚀 FAST logo from localStorage:', fastCache);
        return fastCache;
      }
    } catch (e) {
      // Silent
    }

    // FALLBACK: Get direct URL and cache immediately
    const directUrl = getLogoUrl() || DEFAULT_LOGO_PATH;
    window.__LOGO_CACHE__ = directUrl;

    // Cache in localStorage immediately (sync)
    try {
      localStorage.setItem('__FAST_LOGO__', directUrl);
      console.log('💾 Logo cached to localStorage:', directUrl);
    } catch (e) {
      console.warn('Failed to cache logo:', e);
    }

    console.log('📦 FALLBACK logo cached:', directUrl);
    return directUrl;
  });

  // Force refresh logo function
  const refreshLogo = useCallback(() => {
    console.log('🔄 Force refreshing logo...');

    // Clear all caches
    delete window.__LOGO_CACHE__;
    try {
      localStorage.removeItem('__FAST_LOGO__');
    } catch (e) {
      // Silent
    }

    // Get fresh logo URL
    const freshUrl = getLogoUrl() || DEFAULT_LOGO_PATH;

    // Update state and caches
    setLogoUrl(freshUrl);
    window.__LOGO_CACHE__ = freshUrl;

    try {
      localStorage.setItem('__FAST_LOGO__', freshUrl);
      console.log('✅ Logo force refreshed:', freshUrl);
    } catch (e) {
      console.warn('Failed to cache refreshed logo:', e);
    }
  }, []);

  // Update logo cache when settings change - INSTANT updates
  useEffect(() => {
    if (settings.logoUrl && settings.logoUrl !== logoUrl) {
      console.log('🔄 INSTANT logo update:', settings.logoUrl);

      // Update state immediately
      setLogoUrl(settings.logoUrl);

      // Update ALL caches immediately (sync)
      window.__LOGO_CACHE__ = settings.logoUrl;

      try {
        localStorage.setItem('__FAST_LOGO__', settings.logoUrl);

        // Update school settings cache too
        const schoolSettings = localStorage.getItem('schoolSettings');
        if (schoolSettings) {
          const parsed = JSON.parse(schoolSettings);
          parsed.logoUrl = settings.logoUrl;
          localStorage.setItem('schoolSettings', JSON.stringify(parsed));
        }

        console.log('✅ Logo updated from settings:', settings.logoUrl);
      } catch (e) {
        console.warn('Cache update failed:', e);
      }
    }
  }, [settings.logoUrl, logoUrl]);

  // Load theme settings on component mount
  useEffect(() => {
    loadThemeSettings();
  }, [loadThemeSettings]);

  // Listen for theme settings updates
  useEffect(() => {
    const handleThemeUpdate = (event) => {
      console.log('📡 Sidebar: Theme update received:', event.detail);
      if (event.detail) {
        setThemeSettings(prev => ({
          ...prev,
          mainNavBg: event.detail.mainNavBg || prev.mainNavBg,
          mainNavText: event.detail.mainNavText || prev.mainNavText,
          mainNavHover: event.detail.mainNavHover || prev.mainNavHover
        }));
      }
    };

    window.addEventListener('themeSettingsUpdated', handleThemeUpdate);
    return () => window.removeEventListener('themeSettingsUpdated', handleThemeUpdate);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobile, setIsMobileOpen]);

  // Listen for real-time settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      console.log('📡 Sidebar: Settings update received:', event.detail);
      setLocalSettings(prev => ({ ...prev, ...event.detail }));
    };

    const handleLogoUpdate = (event) => {
      console.log('📡 Sidebar: Logo update received:', event.detail);
      if (event.detail && event.detail.logoUrl) {
        const newLogoUrl = event.detail.logoUrl;

        // Update state immediately
        setLocalSettings(prev => ({ ...prev, logoUrl: newLogoUrl }));
        setLogoUrl(newLogoUrl);

        // Update ALL caches immediately
        window.__LOGO_CACHE__ = newLogoUrl;

        try {
          localStorage.setItem('__FAST_LOGO__', newLogoUrl);

          // Also update school settings cache
          const schoolSettings = localStorage.getItem('schoolSettings');
          if (schoolSettings) {
            const parsed = JSON.parse(schoolSettings);
            parsed.logoUrl = newLogoUrl;
            localStorage.setItem('schoolSettings', JSON.stringify(parsed));
          }

          console.log('✅ Logo cache updated everywhere:', newLogoUrl);
        } catch (e) {
          console.warn('Cache update failed:', e);
        }
      }
    };

    window.addEventListener('schoolSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('schoolSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    },
    {
      path: '/admin/news',
      name: 'Kelola Berita',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      path: '/admin/gallery',
      name: 'Kelola Galeri',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/admin/contacts',
      name: 'Kontak WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"/>
        </svg>
      )
    },
    
    {
      path: '/admin/pengguna',
      name: 'Kelola Pengguna',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      )
    },
    {
      path: '/admin/social-media',
      name: 'Sosial Media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v2m0 0v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4m0 0V2a1 1 0 011-1h2a1 1 0 011 1v2m0 0h10M9 7h6m-6 4h6m-6 4h6" />
        </svg>
      )
    },
    {
      path: '/admin/settings',
      name: 'Pengaturan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Call the public logout endpoint (no auth required)
      try {
        await api.post('/auth/logout');
      } catch (logoutError) {
        // Continue with logout even if API fails
      }
    } catch (error) {
      console.error('Logout process error:', error);
      // Continue with logout even if API fails
    } finally {
      // Clear all auth data
      clearAuthTokens();
      localStorage.removeItem('adminAuth');

      // Set logout success flag for login page
      sessionStorage.setItem('logoutSuccess', 'true');

      // Navigate to login
      navigate('/admin/login', { replace: true });
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`text-white transition-all duration-300 flex flex-col ${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0`
          : `${isCollapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0`
      }`}
        style={{
          backgroundColor: themeSettings.mainNavBg,
          color: themeSettings.mainNavText
        }}>
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderBottomColor: `${themeSettings.mainNavBg}dd` }}>
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center">
              {/* Logo */}
              <LogoImage
                src={logoUrl}
                alt={`Logo ${settings.schoolShortName || 'Sekolah'}`}
                className="h-10 w-10 mr-3 object-contain"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                  opacity: 1,
                  visibility: 'visible'
                }}
                showLoadingState={false}
                loading="eager"
                fetchPriority="high"
                onLoad={() => console.log('✅ Admin sidebar logo loaded:', logoUrl)}
                onError={() => console.log('❌ Admin sidebar logo error:', logoUrl)}
              />

              {/* Text */}
              <div>
                <h2 className="text-lg font-bold">Admin Panel</h2>
                <p className="text-blue-200 text-sm">
                  {localSettings.schoolShortName || settings.schoolShortName || 'Sistem Informasi Sekolah'}
                </p>
              </div>
            </div>
          )}

          {/* Logo untuk collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="flex items-center justify-center">
              <LogoImage
                src={logoUrl}
                alt={`Logo ${settings.schoolShortName || 'Sekolah'}`}
                className="h-8 w-8 object-contain"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                  opacity: 1,
                  visibility: 'visible'
                }}
                title={`Admin Panel - ${localSettings.schoolShortName || settings.schoolShortName || 'Sekolah'}`}
                showLoadingState={false}
                loading="eager"
                fetchPriority="high"
                onLoad={() => console.log('✅ Admin sidebar collapsed logo loaded:', logoUrl)}
                onError={() => console.log('❌ Admin sidebar collapsed logo error:', logoUrl)}
              />
            </div>
          )}

          {isMobile ? (
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="p-2 rounded-lg transition duration-300"
              style={{
                ':hover': { backgroundColor: themeSettings.mainNavHover }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeSettings.mainNavHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg transition duration-300"
              onMouseEnter={(e) => e.target.style.backgroundColor = themeSettings.mainNavHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-blue-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? themeSettings.mainNavHover : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = themeSettings.mainNavHover;
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#dbeafe'; // text-blue-100
                    }
                  }}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div
        className="p-4 border-t"
        style={{ borderTopColor: `${themeSettings.mainNavBg}dd` }}>
        {(!isCollapsed || isMobile) && (
          <div className="mb-4">
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeSettings.mainNavHover }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-blue-200">
                  {user?.email || 'admin@school.com'}
                </p>
                <p className="text-xs text-blue-300 capitalize">
                  {user?.role || 'admin'}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center p-3 rounded-lg text-blue-100 hover:bg-red-500 hover:text-white transition duration-300 ${
            (isCollapsed && !isMobile) ? 'w-full justify-center' : 'w-full'
          }`}
          title={(isCollapsed && !isMobile) ? 'Logout' : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {(!isCollapsed || isMobile) && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>

    {/* Logout Modal */}
    <LogoutModal
      isOpen={showLogoutModal}
      onClose={cancelLogout}
      onConfirm={confirmLogout}
    />
    </>
  );
};

export default Sidebar;
