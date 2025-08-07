import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Cache for news details
const newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const STORAGE_KEY = 'newsDetailCache';
let localStorageAvailable = true; // Track if localStorage is available

// Get cached news detail
const getCachedNews = (id) => {
  const cached = newsCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Clean up expired cache entries
const cleanupExpiredCache = (cacheData) => {
  const now = Date.now();
  const cleanedCache = {};
  let count = 0;

  // Sort by timestamp (newest first) and keep only valid, recent entries
  const sortedEntries = Object.entries(cacheData)
    .filter(([, item]) => now - item.timestamp < CACHE_DURATION)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp)
    .slice(0, MAX_CACHE_SIZE);

  sortedEntries.forEach(([id, item]) => {
    cleanedCache[id] = item;
    count++;
  });

  return { cleanedCache, count };
};

// Set cached news detail
const setCachedNews = (id, data) => {
  // Update in-memory cache
  newsCache.set(id, {
    data,
    timestamp: Date.now()
  });

  // Only attempt localStorage if it's available
  if (!localStorageAvailable) {
    return;
  }

  // Update localStorage with proper cache management
  try {
    // Get existing cache data
    let existingCache = {};
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        existingCache = JSON.parse(cached);
      }
    } catch (parseError) {
      console.warn('Failed to parse existing cache, starting fresh:', parseError);
      existingCache = {};
    }

    // Add new item to cache
    existingCache[id] = {
      data,
      timestamp: Date.now()
    };

    // Clean up expired and excess entries
    const { cleanedCache } = cleanupExpiredCache(existingCache);

    // Try to store the cleaned cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedCache));
  } catch (error) {
    console.warn('Failed to cache news detail in localStorage:', error);

    // If quota exceeded, disable localStorage caching entirely
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Disabling localStorage caching for this session.');
      localStorageAvailable = false;

      // Try to clear the cache to free up space for other parts of the app
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.info('Cleared news cache to free up localStorage space');
      } catch (clearError) {
        console.warn('Failed to clear cache:', clearError);
      }
    }
  }
};

// Load cached news from localStorage
const loadCachedNewsFromStorage = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);

      // Clean up expired entries while loading
      const { cleanedCache, count } = cleanupExpiredCache(parsedCache);

      // Load valid entries into memory cache
      Object.entries(cleanedCache).forEach(([id, cacheItem]) => {
        newsCache.set(id, cacheItem);
      });

      // Update localStorage with cleaned cache if cleanup occurred
      if (count !== Object.keys(parsedCache).length) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedCache));
        } catch (updateError) {
          console.warn('Failed to update cleaned cache:', updateError);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load cached news from localStorage:', error);
    // Clear corrupted cache
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.warn('Failed to clear corrupted cache:', clearError);
    }
  }
};

// Initialize cache from localStorage
loadCachedNewsFromStorage();

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize with cached data if available
  const [news, setNews] = useState(() => getCachedNews(id));
  const [error, setError] = useState(null);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setError(null);
        setFetchCompleted(false);

        // Check if we already have cached data
        const cachedData = getCachedNews(id);
        if (cachedData) {
          setNews(cachedData);
          // Still fetch fresh data in background but don't show loading
        }

        const response = await fetch(`${API_BASE_URL}/news/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            // News not found
            setNews(null);
            setFetchCompleted(true);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setNews(data.data);
          setCachedNews(id, data.data);
          setFetchCompleted(true);

          // Increment views when news detail is loaded (in background)
          try {
            fetch(`${API_BASE_URL}/news/${id}/views`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }).catch(viewError => {
              console.error('Failed to increment views:', viewError);
            });
          } catch (viewError) {
            console.error('Failed to increment views:', viewError);
          }
        } else {
          // API returned success: false
          setNews(null);
          setFetchCompleted(true);
        }
      } catch (err) {
        console.error('Error fetching news detail:', err);
        setFetchCompleted(true);
        // Only set error if we don't have cached data
        if (!getCachedNews(id)) {
          setError(err.message);
        }
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id, API_BASE_URL]);

  // Removed loading state - show content immediately with cached data or empty state

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Error: {error}</p>
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => navigate('/news')} 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Kembali ke Berita
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show "not found" if fetch is completed and there's really no data
  if (!news && fetchCompleted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Berita tidak ditemukan
            </h3>
            <button
              onClick={() => navigate('/news')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Kembali ke Berita
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no news data yet (still loading), show nothing or minimal content
  if (!news) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button - always show */}
          <button
            onClick={() => navigate('/news')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Berita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/news')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 transition-colors duration-200 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Kembali ke Berita</span>
          <span className="sm:hidden">Kembali</span>
        </button>

        {/* Article Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full">
              {news.category}
            </span>
            {news.featured && (
              <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-full">
                Unggulan
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {news.title}
          </h1>
          
          {/* Meta Info - Mobile Style Layout */}
          <div className="flex flex-col text-gray-600 text-xs sm:text-sm space-y-2">
            <div className="flex items-center">
              <span>Oleh {news.author?.name || 'Admin'}</span>
              <span className="mx-2">•</span>
              <span>
                {new Date(news.published_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            {news.views !== undefined && (
              <div className="flex items-center">
                <span className="flex items-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {news.views || 0} views
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {news.image_url && (
          <div className="mb-6 sm:mb-8">
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
          {news.excerpt && (
            <div className="text-base sm:text-lg lg:text-xl text-gray-700 font-medium mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              {news.excerpt}
            </div>
          )}

          <div
            className="text-gray-800 leading-relaxed text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bagikan Artikel:</h3>
          <div className="flex flex-col min-[900px]:flex-row gap-3 min-[900px]:gap-4">
            {/* Twitter */}
            <button
              onClick={() => {
                const url = window.location.href;
                const excerpt = news.excerpt ? news.excerpt.substring(0, 80) + '...' : '';
                const isDesktop = window.innerWidth >= 900;

                const text = isDesktop ?
                  `📰 ${news.title} - Portal Sekolah

${excerpt}

#Berita #${news.category.replace(/\s+/g, '')} #PortalSekolah #Sekolah` :
                  `📰 ${news.title}

${excerpt}

#Berita #${news.category.replace(/\s+/g, '')} #Sekolah`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex items-center justify-center min-[900px]:justify-start px-3 min-[900px]:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm min-[900px]:text-base"
            >
              <svg className="w-4 h-4 min-[900px]:w-5 min-[900px]:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="hidden min-[900px]:inline">Twitter</span>
              <span className="min-[900px]:hidden">Tweet</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden sm:inline">Facebook</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                const url = window.location.href;
                const currentDate = new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                const excerpt = news.excerpt ? news.excerpt.substring(0, 100) + '...' : '';
                const author = news.author?.name || 'Admin';

                // Check if screen width is more than 900px
                const isDesktop = window.innerWidth >= 900;

                const text = isDesktop ?
                  `📰 *BERITA TERBARU - Portal Sekolah*

*${news.title}*

${excerpt}

📅 ${currentDate}
✍️ Oleh: ${author}
👁️ ${news.views || 0} views
🏷️ Kategori: ${news.category}

Baca selengkapnya di Portal Sekolah:
${url}

#Berita #${news.category.replace(/\s+/g, '')} #PortalSekolah #Sekolah` :
                  `📰 *BERITA TERBARU*

*${news.title}*

${excerpt}

📅 ${currentDate}
✍️ Oleh: ${author}
👁️ ${news.views || 0} views
🏷️ Kategori: ${news.category}

Baca selengkapnya di:
${url}

#Berita #${news.category.replace(/\s+/g, '')} #Sekolah`;

                // Use WhatsApp Web URL instead of wa.me for better compatibility
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile) {
                  // For mobile devices, use wa.me
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                } else {
                  // For desktop, use WhatsApp Web
                  window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }
              }}
              className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => {
                const url = window.location.href;
                const isDesktop = window.innerWidth >= 900;

                navigator.clipboard.writeText(url).then(() => {
                  // Show toast notification
                  const toast = document.createElement('div');
                  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
                  toast.textContent = isDesktop ? 'Link artikel berhasil disalin ke clipboard!' : 'Link berhasil disalin!';
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                  }, 2500);
                }).catch(() => {
                  // Fallback for older browsers
                  const toast = document.createElement('div');
                  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                  toast.textContent = 'Gagal menyalin link. Silakan salin manual.';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                });
              }}
              className="flex items-center justify-center min-[900px]:justify-start px-3 min-[900px]:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm min-[900px]:text-base"
            >
              <svg className="w-4 h-4 min-[900px]:w-5 min-[900px]:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden min-[900px]:inline">Copy Link</span>
              <span className="min-[900px]:hidden">Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
