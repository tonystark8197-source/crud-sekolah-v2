import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSchoolSettings } from '../hooks/useSchoolSettings';
import LogoImage from './LogoImage';
import api from '../services/api';

const NavbarNew = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSchoolSettings();

  // Helper function untuk styling menu items
  const getMenuItemStyle = () => ({
    color: themeSettings.mainNavText,
    backgroundColor: 'transparent'
  });

  const handleMenuItemHover = (e, isEnter) => {
    if (isEnter) {
      e.currentTarget.style.backgroundColor = themeSettings.mainNavHover + '50';
    } else {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };
  
  // State untuk social media dan theme
  const [socialMedia, setSocialMedia] = useState([
    // Default social media jika database kosong
    { icon: 'fab fa-facebook-f', url: 'https://facebook.com', name: 'Facebook' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com', name: 'Twitter' },
    { icon: 'fab fa-instagram', url: 'https://instagram.com', name: 'Instagram' },
    { icon: 'fab fa-youtube', url: 'https://youtube.com', name: 'YouTube' }
  ]);
  const [themeSettings, setThemeSettings] = useState({
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
    mainNavHover: '#3b82f6'
  });

  // Load theme dari API
  const loadTheme = async () => {
    try {
      const timestamp = Date.now();
      const response = await api.get(`/theme-settings?_t=${timestamp}&nocache=1`);

      if (response.data.success && response.data.data && response.data.data.colors) {
        const colors = response.data.data.colors;
        const newThemeSettings = {
          headerBg: colors.headerBg || '#1e3a8a',
          headerText: colors.headerText || '#ffffff',
          headerAccent: colors.headerAccent || '#3b82f6',
          topNavBg: colors.topNavBg || '#2563eb',
          topNavText: colors.topNavText || '#ffffff',
          topNavIconColor: colors.topNavIconColor || '#e5e7eb',
          navbarBg: colors.navbarBg || '#2563eb',
          navbarText: colors.navbarText || '#ffffff',
          navbarHover: colors.navbarHover || '#3b82f6',
          mainNavBg: colors.mainNavBg || '#2563eb',
          mainNavText: colors.mainNavText || '#ffffff',
          mainNavHover: colors.mainNavHover || '#3b82f6'
        };

        setThemeSettings(newThemeSettings);
      }
    } catch (error) {
      // Keep default settings if error
    }
  };

  // Load social media dan theme settings
  useEffect(() => {
    const loadData = () => {
      try {
        // Load social media dari localStorage
        const savedSocialMedia = localStorage.getItem('socialMediaSettings');
        if (savedSocialMedia) {
          const socialData = JSON.parse(savedSocialMedia);
          if (socialData && Object.keys(socialData).length > 0) {
            // Convert object to array format yang diharapkan
            const socialArray = Object.entries(socialData).map(([platform, url]) => ({
              platform,
              url
            })).filter(item => item.url);

            if (socialArray.length > 0) {
              setSocialMedia(socialArray);
            }
          }
        }
      } catch (error) {
        console.error('Error loading navbar data from localStorage:', error);
      }
    };

    // Load theme from API
    loadTheme();

    // Load social media from localStorage
    loadData();

    // Event listeners for theme updates
    const handleThemeUpdate = () => {
      loadTheme();
    };

    const handleStorageChange = (event) => {
      if (event.key === 'themeSettings') {
        loadTheme();
      } else if (event.key === 'socialMediaSettings') {
        loadData();
      }
    };

    window.addEventListener('themeUpdated', handleThemeUpdate);
    window.addEventListener('forceThemeReload', handleThemeUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Auto refresh theme every 5 seconds
    const pollInterval = setInterval(loadTheme, 5000);

    return () => {
      window.removeEventListener('themeUpdated', handleThemeUpdate);
      window.removeEventListener('forceThemeReload', handleThemeUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Top Nav - Social Media + Alamat - Hidden di mobile */}
      <div
        className="py-2 hidden min-[900px]:block"
        style={{ backgroundColor: themeSettings.topNavBg, color: themeSettings.topNavText }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            
            {/* Social Media Icons - Kiri */}
            <div className="flex items-center space-x-4">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75 transition-opacity duration-200"
                  style={{ color: themeSettings.topNavIconColor }}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>

            {/* Alamat - Kanan */}
            <div
              className="flex items-center space-x-2"
              style={{ color: themeSettings.topNavIconColor }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{settings?.schoolAddress || 'Alamat Sekolah'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header - Logo + Teks */}
      <div
        className="py-4 border-b"
        style={{
          backgroundColor: themeSettings.headerBg,
          borderColor: themeSettings.headerAccent
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-4">
              <LogoImage
                src={settings?.logoUrl}
                alt={`Logo ${settings?.schoolShortName || 'Sekolah'}`}
                className="h-16 w-16 object-contain"
                showLoadingState={false}
              />
              <div className="text-center">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: themeSettings.headerText }}
                >
                  {settings?.schoolName || 'SMK NEGERI TEMBARAK'}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: themeSettings.headerText, opacity: 0.8 }}
                >
                  {settings?.schoolMotto || 'Unggul dalam Prestasi, Berkarakter dalam Budi Pekerti'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav
        className="shadow-md"
        style={{ backgroundColor: themeSettings.navbarBg }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Social Media Icons - Mobile */}
            <div className="min-[900px]:hidden flex items-center space-x-3">
              {socialMedia.slice(0, 3).map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200"
                  style={{
                    color: themeSettings.navbarText,
                  }}
                  onMouseEnter={(e) => e.target.style.color = themeSettings.navbarHover}
                  onMouseLeave={(e) => e.target.style.color = themeSettings.navbarText}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>

            {/* Desktop Menu - Tampil langsung di >900px */}
            <div className="hidden min-[900px]:flex items-center justify-center w-full space-x-2">
              <Link
                to="/"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Beranda
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Tentang Kami
              </Link>
              <Link
                to="/news"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Berita
              </Link>
              <Link
                to="/gallery"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Galeri
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Kontak
              </Link>
              <Link
                to="/students"
                className="px-6 py-3 font-medium hover:bg-white hover:bg-opacity-25 rounded-lg transition-all duration-300 hover:shadow-md"
                style={{ color: themeSettings.navbarText }}
              >
                Siswa
              </Link>
            </div>

            {/* Mobile Menu Button - Tampil di <900px */}
            <div className="min-[900px]:hidden flex items-center justify-end w-full">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-lg hover:bg-white hover:bg-opacity-25 transition-all duration-300"
                style={{ color: themeSettings.navbarText }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Sidebar - Muncul dari kanan ke kiri */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 min-[900px]:hidden"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar - Slide dari kanan */}
            <div
              className={`fixed top-0 right-0 h-full w-80 shadow-2xl transform transition-transform duration-300 ease-out z-50 min-[900px]:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
              style={{ backgroundColor: themeSettings.mainNavBg }}
            >

              {/* Sidebar Header */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{
                  backgroundColor: themeSettings.mainNavHover,
                  borderColor: themeSettings.mainNavText + '30'
                }}
              >
                <div className="flex items-center">
                  <LogoImage
                    src={settings?.logoUrl}
                    alt={`Logo ${settings?.schoolShortName || 'Sekolah'}`}
                    className="h-10 w-10 mr-3 object-contain"
                    showLoadingState={false}
                  />
                  <div>
                    <h3
                      className="font-bold text-lg"
                      style={{ color: themeSettings.mainNavText }}
                    >
                      {settings?.schoolShortName || 'SMK N TEMBARAK'}
                    </h3>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full transition-colors duration-200"
                  style={{
                    color: themeSettings.mainNavText,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = themeSettings.mainNavText + '20'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sidebar Menu */}
              <nav className="px-4 py-6">
                <div className="space-y-2">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 group"
                    style={{ color: themeSettings.mainNavText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = themeSettings.mainNavHover + '50';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: themeSettings.mainNavText, opacity: 0.7 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">Beranda</span>
                  </Link>

                  {[
                    { to: "/about", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", text: "Tentang Kami" },
                    { to: "/news", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", text: "Berita" },
                    { to: "/gallery", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", text: "Galeri" },
                    { to: "/contact", icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Kontak" },
                    { to: "/students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", text: "Siswa" }
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center px-4 py-3 rounded-lg transition-all duration-200"
                      style={{ color: themeSettings.mainNavText }}
                      onMouseEnter={(e) => handleMenuItemHover(e, true)}
                      onMouseLeave={(e) => handleMenuItemHover(e, false)}
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: themeSettings.mainNavText, opacity: 0.7 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="font-medium">{item.text}</span>
                    </Link>
                  ))}
                </div>

                {/* Social Media di Sidebar */}
                <div
                  className="mt-8 pt-6 border-t"
                  style={{ borderColor: themeSettings.mainNavText + '30' }}
                >
                  <h4
                    className="text-sm font-medium mb-4"
                    style={{ color: themeSettings.mainNavText, opacity: 0.7 }}
                  >
                    Ikuti Kami
                  </h4>
                  <div className="flex space-x-4">
                    {socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-200"
                        style={{ color: themeSettings.mainNavText, opacity: 0.7 }}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                      >
                        <i className={`${social.icon} text-xl`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

export default NavbarNew;
