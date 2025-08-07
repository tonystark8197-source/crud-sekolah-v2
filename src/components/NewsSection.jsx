import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NewsSection = ({ news = [], settings = {} }) => { // Remove loading prop
  const navigate = useNavigate();

  // Instant navigation function
  const handleNewsClick = (newsId, e) => {
    e.preventDefault();
    // Use navigate with replace to make it instant
    navigate(`/news/${newsId}`, { replace: false });
  };

  // Preload news detail on hover
  const handleNewsHover = async (newsId) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      // Preload the news detail in background
      fetch(`${API_BASE_URL}/news/${newsId}`).catch(() => {
        // Silent fail for preload
      });
    } catch (error) {
      // Silent fail for preload
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Function to get correct image URL
  const getImageUrl = (newsItem) => {
    if (!newsItem || !newsItem.image_url) {
      return '/placeholder-news.jpg';
    }

    const imageUrl = newsItem.image_url;

    // If it's already a full URL from backend (http://localhost:8000/images/news/), convert to frontend path
    if (imageUrl.startsWith('http://localhost:8000/images/news/')) {
      const filename = imageUrl.split('/').pop();
      const frontendPath = `/images/news/${filename}`;
      return frontendPath;
    }

    // If it's already a full URL (starts with http), return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // If it's /images/news path (frontend public format), use directly
    if (imageUrl.startsWith('/images/news/')) {
      return imageUrl;
    }

    // If it's a relative path starting with /storage/ (old format), add backend URL
    if (imageUrl.startsWith('/storage/')) {
      return `http://localhost:8000${imageUrl}`;
    }

    // If it's uploads path (old format), add backend URL
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:8000${imageUrl}`;
    }

    // Default fallback
    return '/placeholder-news.jpg';
  };

  // Get background style from settings
  const getBackgroundStyle = () => {
    const bgColor = settings.newsBackgroundColor || '#f8fafc';
    const bgImage = settings.newsBackgroundImage;
    
    if (bgImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {
      backgroundColor: bgColor
    };
  };

  // Remove loading state - always show content immediately

  return (
    <section key="news-content" className="py-16" style={getBackgroundStyle()}>
      <div className="w-full px-0">
        {/* Section Header */}
        <div className="text-center mb-12 px-8 sm:px-12 lg:px-16 xl:px-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Berita Terbaru
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ikuti perkembangan terbaru dan informasi penting dari sekolah kami
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-[900px]:grid-cols-3 gap-6 mb-12 px-8 sm:px-12 lg:px-16 xl:px-20">
          {Array.isArray(news) && news.slice(0, 9).map((newsItem) => {
            if (!newsItem || !newsItem.id) return null;
            return (
            <article
              key={`news-${newsItem.id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              onMouseEnter={() => handleNewsHover(newsItem.id)}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {newsItem.image_url ? (
                  <img
                    src={getImageUrl(newsItem)}
                    alt={newsItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    style={{
                      opacity: 1,
                      visibility: 'visible',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-news.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {newsItem.category || 'Berita'}
                  </span>
                </div>

                {/* Date Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    {formatDate(newsItem.published_at || newsItem.created_at)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  <Link
                    to={`/news/${newsItem.id}`}
                    onClick={(e) => handleNewsClick(newsItem.id, e)}
                  >
                    {newsItem.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                  {truncateText(newsItem.excerpt || newsItem.content)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/news/${newsItem.id}`}
                    onClick={(e) => handleNewsClick(newsItem.id, e)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center transition-colors duration-300 group/link"
                  >
                    Baca Selengkapnya
                    <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  {/* Views */}
                  {newsItem.views !== undefined && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {newsItem.views || 0}
                    </div>
                  )}
                </div>
              </div>
            </article>
            );
          })}
        </div>

        {/* View All Button */}
        {Array.isArray(news) && news.length > 9 && (
          <div className="text-center px-8 sm:px-12 lg:px-16 xl:px-20">
            <Link
              to="/news"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Lihat Semua Berita
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {Array.isArray(news) && news.length === 0 && (
          <div className="text-center py-12 px-8 sm:px-12 lg:px-16 xl:px-20">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Berita</h3>
              <p className="text-gray-600 mb-4">
                Berita terbaru akan ditampilkan di sini setelah dipublikasikan oleh admin.
              </p>
              <Link
                to="/news"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                Kunjungi Halaman Berita
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
