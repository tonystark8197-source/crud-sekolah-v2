import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from '../ui/PageTransition';
import { SidebarProvider, useSidebar } from '../../hooks/useSidebar.jsx';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';

const AdminLayoutContent = ({ children }) => {
  const navigate = useNavigate();
  const { sidebarWidth, setIsMobileOpen } = useSidebar();
  const { user } = useAdminAuth();
  const { settings, loading } = useSchoolSettings();

  useEffect(() => {
    // Simplified auth check - only redirect if absolutely no auth data
    const authData = localStorage.getItem('adminAuth');

    if (!authData) {
      // Only redirect if there's no auth data at all
      navigate('/admin/login', { replace: true });
      return;
    }

    try {
      const parsedAuth = JSON.parse(authData);
      if (!parsedAuth.token || !parsedAuth.user) {
        navigate('/admin/login', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
      navigate('/admin/login', { replace: true });
      return;
    }

    // If auth data exists and is valid, let useAdminAuth hook handle the validation
    // This prevents double redirects and allows navigation between admin pages
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center">
            {/* Logo */}
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={`Logo ${settings.schoolShortName || 'Sekolah'}`}
                className="h-8 w-8 mr-2 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}

            {/* Text */}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">
                {loading ? 'Loading...' : (settings.schoolShortName || 'Sistem Informasi Sekolah')}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="lg:hidden h-16 flex-shrink-0"></div> {/* Spacer for mobile header */}
        <div className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
};

export default AdminLayout;
