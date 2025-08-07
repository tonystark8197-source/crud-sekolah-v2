import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { api } from '../../services/api';
import ActivityService from '../../services/activityService';

// Add CSS for line-clamp
const styles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalGallery: 0,
    totalUsers: 0,
    totalMessages: 0
  });
  const [recentNews, setRecentNews] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    loadDashboardData();

    // Setup global refresh function
    window.refreshDashboard = () => {
      loadDashboardData();
    };

    // Cleanup
    return () => {
      delete window.refreshDashboard;
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats with error handling for each endpoint
      const results = await Promise.allSettled([
        api.get('/news'),
        api.get('/gallery'),
        api.get('/users'),
        api.get('/contacts')
      ]);

      const [newsRes, galleryRes, usersRes, contactsRes] = results.map(result =>
        result.status === 'fulfilled' ? result.value : { data: [] }
      );

      console.log('API Responses:', { newsRes, galleryRes, usersRes, contactsRes });
      console.log('News data:', newsRes.data);
      console.log('Gallery data:', galleryRes.data);
      console.log('Users data:', usersRes.data);
      console.log('Contacts data:', contactsRes.data);

      const newStats = {
        totalNews: Array.isArray(newsRes.data) ? newsRes.data.length : (newsRes.data?.data?.length || newsRes.data?.length || 0),
        totalGallery: Array.isArray(galleryRes.data) ? galleryRes.data.length : (galleryRes.data?.data?.length || galleryRes.data?.length || 0),
        totalUsers: Array.isArray(usersRes.data) ? usersRes.data.length : (usersRes.data?.data?.length || usersRes.data?.length || 0),
        totalMessages: Array.isArray(contactsRes.data) ? contactsRes.data.length : (contactsRes.data?.data?.length || contactsRes.data?.length || 0)
      };

      console.log('Calculated Stats:', newStats);
      setStats(newStats);

      // Load recent news (last 5)
      const newsData = Array.isArray(newsRes.data) ? newsRes.data : (newsRes.data?.data || []);
      if (newsData.length > 0) {
        setRecentNews(newsData.slice(0, 5));
      }

      // Load recent messages (last 5)
      const contactsData = Array.isArray(contactsRes.data) ? contactsRes.data : (contactsRes.data?.data || []);
      if (contactsData.length > 0) {
        setMessages(contactsData.slice(0, 5));
      }

      // Load recent activities from API or localStorage
      try {
        const activitiesRes = await api.get('/admin/activities');
        if (activitiesRes.data) {
          setRecentActivities(activitiesRes.data.slice(0, 5));
        }
      } catch {
        console.log('Activities endpoint not available, using localStorage');
        // Fallback to localStorage activities
        const localActivities = ActivityService.getLocalActivities();
        if (localActivities.length > 0) {
          setRecentActivities(localActivities);
        } else {
          // Default mock data jika localStorage kosong
          setRecentActivities([
            { id: 1, action: 'Dashboard dimuat', time: 'Baru saja', type: 'settings' },
            { id: 2, action: 'Sistem siap digunakan', time: '1 menit yang lalu', type: 'settings' }
          ]);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityIcon = ({ type }) => {
    const icons = {
      news: (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
        </svg>
      ),
      gallery: (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
        </svg>
      ),
      user: (
        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      ),
      message: (
        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
        </svg>
      ),
      settings: (
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      )
    };
    return icons[type] || icons.settings;
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di panel admin SMK Negeri Tembarak</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-[900px]:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Berita"
            value={stats.totalNews}
            link="/admin/news"
            color="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            }
          />
          <StatCard
            title="Total Galeri"
            value={stats.totalGallery}
            link="/admin/gallery"
            color="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
            }
          />
          <StatCard
            title="Total Pengguna"
            value={stats.totalUsers}
            link="/admin/users"
            color="bg-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            }
          />
          <StatCard
            title="Pesan Masuk"
            value={stats.totalMessages}
            link="/admin/contacts"
            color="bg-orange-100"
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Berita Terbaru */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Berita Terbaru</h2>
                <Link to="/admin/news" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Lihat Semua →
                </Link>
              </div>
              <div className="space-y-4">
                {recentNews.length > 0 ? (
                  recentNews.map((news) => (
                    <div key={news.id} className="flex items-start space-x-4 p-3 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {news.image_url ? (
                          <img
                            src={`http://localhost:8000${news.image_url}`}
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {news.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(news.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <p>Belum ada berita</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Aktivitas Terbaru</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Pesan Masuk & Aksi Cepat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pesan Masuk */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pesan Masuk</h2>
              <Link to="/admin/contacts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Lihat Semua →
              </Link>
            </div>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {message.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <p>Belum ada pesan</p>
                </div>
              )}
            </div>
          </div>

          {/* Aksi Cepat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/news/create" className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                <svg className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                <span className="text-sm font-medium text-blue-700">Tulis Berita</span>
              </Link>

              <Link to="/admin/gallery/create" className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                <svg className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-medium text-green-700">Upload Foto</span>
              </Link>

              <Link to="/admin/users/create" className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                <svg className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                </svg>
                <span className="text-sm font-medium text-purple-700">Tambah User</span>
              </Link>

              <Link to="/admin/settings" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                <svg className="w-8 h-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Pengaturan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;