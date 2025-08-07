import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


const newsPageMemoryCache = new Map();
const preloadedNewsImages = new Set();
const newsImageCache = new Map(); 
const newsBlobCache = new Map(); 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    newsImageCache.forEach((blobUrl) => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    });
  });
}

const News = () => {

  const getCachedNews = (category) => {
    try {
      const cacheKey = `newsPage_${category}`;

      if (newsPageMemoryCache.has(cacheKey)) {
        return newsPageMemoryCache.get(cacheKey);
      }


      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedData = JSON.parse(cached);
       
        newsPageMemoryCache.set(cacheKey, parsedData);
        return parsedData;
      }
    } catch {
      // Silent error handling
    }
    return [];
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [news, setNews] = useState(getCachedNews('all'));
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = ['all', 'Prestasi', 'Akademik', 'Kegiatan', 'Pengumuman', 'Fasilitas'];


  const cacheNewsImage = useCallback(async (src) => {
    if (!src || newsImageCache.has(src)) return newsImageCache.get(src) || src;

    try {
   
      const response = await fetch(src);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

   
        newsBlobCache.set(src, blob);
        newsImageCache.set(src, blobUrl);
        preloadedNewsImages.add(src);

        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            localStorage.setItem(`news_img_cache_${btoa(src)}`, reader.result);
          } catch {
            // Storage full, ignore
          }
        };
        reader.readAsDataURL(blob);

        return blobUrl;
      }
    } catch {
      // Fallback to original src
    }

    newsImageCache.set(src, src);
    return src;
  }, []);

  const getCachedNewsImageUrl = useCallback((src) => {
    if (!src) return '/placeholder-news.jpg';

   
    if (newsImageCache.has(src)) {
      return newsImageCache.get(src);
    }

    
    try {
      const cached = localStorage.getItem(`news_img_cache_${btoa(src)}`);
      if (cached) {
        newsImageCache.set(src, cached);
        return cached;
      }
    } catch {
      // Ignore localStorage errors
    }

    
    cacheNewsImage(src);
    return src;
  }, [cacheNewsImage]);

  
  useEffect(() => {
    const initialNews = getCachedNews('all');
    if (initialNews.length > 0) {
      initialNews.forEach(async (newsItem) => {
        const imageUrl = getImageUrl(newsItem);
        if (imageUrl && imageUrl !== '/placeholder-news.jpg') {
          await cacheNewsImage(imageUrl);
        }
      });
    }
  }, [cacheNewsImage]); 


  const getImageUrl = (newsItem) => {
    if (!newsItem || !newsItem.image_url) {
      return '/placeholder-image.jpg';
    }

    const imageUrl = newsItem.image_url;
    if (imageUrl.startsWith('http://localhost:8000/images/news/')) {
      const filename = imageUrl.split('/').pop();
      const frontendPath = `/images/news/${filename}`;
      return frontendPath;
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/images/news/')) {
      return imageUrl;
    }

    return '/placeholder-image.jpg';
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setError(null);

        const response = await fetch(`${API_BASE_URL}/news`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const newNews = data.data || [];
          const currentNewsStr = JSON.stringify(news);
          const newNewsStr = JSON.stringify(newNews);

          if (currentNewsStr !== newNewsStr) {
            setNews(newNews);

            const cacheKey = `newsPage_all`;
            newsPageMemoryCache.set(cacheKey, newNews);
            localStorage.setItem(cacheKey, JSON.stringify(newNews));
          }
        } else {
          throw new Error(data.message || 'Failed to fetch news');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNews();
  }, [news]);

  useEffect(() => {
    const cachedNews = getCachedNews('all');
    if (cachedNews.length > 0 && news.length === 0) {
      setNews(cachedNews);
    }
  }, [news.length]);

  useEffect(() => {
    if (news.length > 0) {
      
      news.forEach(async (newsItem) => {
        const imageUrl = getImageUrl(newsItem);
        if (imageUrl && imageUrl !== '/placeholder-news.jpg') {
          await cacheNewsImage(imageUrl);
        }
      });
    }
  }, [news, cacheNewsImage]);


  const filteredNews = news.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  
  const handleNewsClick = (newsId) => {
    
    navigate(`/news/${newsId}`);

   
    fetch(`${API_BASE_URL}/news/${newsId}/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Failed to increment views:', error);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {}
      <div className="bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 text-center">
            Berita & Artikel
          </h1>
        </div>
      </div>

      {}
      <div className="max-w-full mx-auto px-2 sm:px-4 py-4">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-102'
              }`}
            >
              {category === 'all' ? 'Semua' : category}
            </button>
          ))}
        </div>
      </div>

      {}

      {}
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {}
      <div className="max-w-full mx-auto px-2 sm:px-4 py-8">
        {}
        {news.length > 0 ? (
          <>
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 min-[900px]:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredNews.map((newsItem) => (
                  <div
                    key={newsItem.id}
                    onClick={() => handleNewsClick(newsItem.id)}
                    className="bg-white transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                    style={{
                      boxShadow: '0 0 15px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 0, 0, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    {}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 m-3">
                      <img
                        src={getCachedNewsImageUrl(getImageUrl(newsItem))}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
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
                    </div>

                  {}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
                      {newsItem.title}
                    </h3>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-base text-gray-500 font-medium">
                        {newsItem.category}
                      </p>
                      {newsItem.featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                          Unggulan
                        </span>
                      )}
                    </div>
                    {newsItem.excerpt && (
                      <p className="text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {newsItem.excerpt}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{newsItem.author?.name || 'Admin'}</span>
                        {newsItem.views !== undefined && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {newsItem.views || 0}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="font-medium">
                        {new Date(newsItem.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Baca Selengkapnya Link */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewsClick(newsItem.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm underline hover:no-underline transition-colors duration-200"
                      >
                        Baca Selengkapnya
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada berita untuk kategori "{selectedCategory}"
                </h3>
                <p className="text-gray-500">
                  Silakan pilih kategori lain atau kembali ke "Semua" untuk melihat semua berita.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Berita
            </h3>
            <p className="text-gray-500">
              Belum ada berita yang tersedia saat ini. Silakan coba lagi nanti.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
