import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavbarNew';
import Footer from './components/Footer';
import { DocumentHead } from './components/DocumentHead';
import { ThemeProvider } from './components/ThemeProvider';
import { AlertProvider } from './contexts/AlertContext';
import LogoDebug from './components/LogoDebug';
import './styles/modal.css';
import Home from './pages/Home';
import HomeSimple from './pages/HomeSimple';
import About from './pages/About';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyCode from './pages/auth/VerifyCode';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import NewsManagement from './pages/admin/NewsManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import ContactManagement from './pages/admin/ContactManagement';
import SocialMediaManagement from './pages/admin/SocialMediaManagement';
import SettingsManagement from './pages/admin/SettingsManagement';
import PenggunaManagement from './pages/admin/PenggunaManagement';

function App() {
  // Initialize logo system on app start
  useEffect(() => {
    // Listen for logo updates from settings
    const handleLogoUpdate = () => {
      try {
        const schoolSettings = localStorage.getItem('schoolSettings');
        if (schoolSettings) {
          const settings = JSON.parse(schoolSettings);
          if (settings.logoUrl && settings.logoUrl !== 'http://localhost:8000/images/logo/logo-school.png') {
            // Sync favicon and title with current settings
            const favicon = document.getElementById('favicon');
            const appleTouchIcon = document.getElementById('apple-touch-icon');

            // Add timestamp to force refresh
            const timestampedUrl = settings.logoUrl.includes('?')
              ? `${settings.logoUrl}&t=${Date.now()}`
              : `${settings.logoUrl}?t=${Date.now()}`;

            if (favicon) favicon.href = timestampedUrl;
            if (appleTouchIcon) appleTouchIcon.href = timestampedUrl;
            console.log('App.jsx: Favicon updated to:', timestampedUrl);
          }

          // Update title with priority: websiteTitle > schoolShortName > default
          const title = document.getElementById('page-title');
          if (title) {
            if (settings.websiteTitle) {
              title.textContent = settings.websiteTitle;
              document.title = settings.websiteTitle;
              console.log('App.jsx: Title updated to:', settings.websiteTitle);
            } else if (settings.schoolShortName) {
              const formattedTitle = `${settings.schoolShortName} - Sistem Informasi`;
              title.textContent = formattedTitle;
              document.title = formattedTitle;
              console.log('App.jsx: Title updated to:', formattedTitle);
            }
          }
        }
      } catch (error) {
        console.error('Error syncing logo on app start:', error);
      }
    };

    // Initial sync
    handleLogoUpdate();

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', handleLogoUpdate);
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('storage', handleLogoUpdate);
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  return (
    <ThemeProvider>
      <AlertProvider>
        <Router>
          <DocumentHead />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow w-full">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/about" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow w-full py-8 pb-16 min-[900px]:pb-8">
              <About />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/news" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-[900px]:pb-8">
              <News />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/news/:id" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-[900px]:pb-8">
              <NewsDetail />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/gallery" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-[900px]:pb-8">
              <Gallery />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 min-[900px]:pb-8">
              <Contact />
            </main>
            <Footer />
          </div>
        } />

        {/* Home Simple Layout */}
        <Route path="/home-simple" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <HomeSimple />
          </div>
        } />



        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/verify-code" element={<VerifyCode />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/news" element={<NewsManagement />} />
        <Route path="/admin/gallery" element={<GalleryManagement />} />
        <Route path="/admin/contacts" element={<ContactManagement />} />
        <Route path="/admin/social-media" element={<SocialMediaManagement />} />
        <Route path="/admin/settings" element={<SettingsManagement />} />
        <Route path="/admin/pengguna" element={<PenggunaManagement />} />
      </Routes>
        </Router>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
