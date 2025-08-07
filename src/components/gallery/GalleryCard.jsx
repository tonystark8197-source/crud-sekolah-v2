import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/gallery-optimization.css';

// Memory cache untuk gallery
const galleryMemoryCache = new Map();
const preloadedGalleryImages = new Set();
const imageCache = new Map(); // Cache untuk blob URLs
const imageBlobCache = new Map(); // Cache untuk image blobs

// Cleanup blob URLs on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    imageCache.forEach((blobUrl, src) => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    });
  });
}

const Gallery = () => {
  // Initialize with cached data
  const getCachedGallery = (category) => {
    try {
      const cacheKey = `gallery_${category}`;

      // Check memory cache first
      if (galleryMemoryCache.has(cacheKey)) {
        return galleryMemoryCache.get(cacheKey);
      }

      // Then check localStorage
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedData = JSON.parse(cached);
        // Store in memory cache for faster access
        galleryMemoryCache.set(cacheKey, parsedData);
        return parsedData;
      }
    } catch (error) {
      // Silent error handling
    }
    return [];
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryImages, setGalleryImages] = useState(getCachedGallery('all'));
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const categories = ['all', 'Kegiatan Rutin', 'Kegiatan Khusus', 'Prestasi', 'Fasilitas', 'Ekstrakurikuler'];

  // Function to get correct image URL
  const getGalleryImageUrl = (galleryItem) => {
    if (!galleryItem || !galleryItem.image_url) {
      return '/placeholder-image.jpg';
    }

    const imageUrl = galleryItem.image_url;

    // If it's already a full URL from backend, convert to frontend path
    if (imageUrl.startsWith('http://localhost:8000/images/gallery/')) {
      const filename = imageUrl.split('/').pop();
      const frontendPath = `/images/gallery/${filename}`;
      return frontendPath;
    }

    // If it's already a frontend path, use directly
    if (imageUrl.startsWith('/images/gallery/')) {
      return imageUrl;
    }

    // Default fallback
    return '/placeholder-image.jpg';
  };

  // Aggressive image caching function
  const cacheImage = useCallback(async (src) => {
    if (!src || imageCache.has(src)) return imageCache.get(src) || src;

    try {
      // Try to fetch and cache as blob for instant display
      const response = await fetch(src);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Cache both blob and blob URL
        imageBlobCache.set(src, blob);
        imageCache.set(src, blobUrl);
        preloadedGalleryImages.add(src);

        // Also cache in localStorage as base64 for persistence
        const reader = new FileReader();
        reader.onload = () => {
          try {
            localStorage.setItem(`img_cache_${btoa(src)}`, reader.result);
          } catch (e) {
            // Storage full, ignore
          }
        };
        reader.readAsDataURL(blob);

        return blobUrl;
      }
    } catch (error) {
      // Fallback to original src
    }

    imageCache.set(src, src);
    return src;
  }, []);

  // Get cached image URL
  const getCachedImageUrl = useCallback((src) => {
    if (!src) return '/placeholder-image.jpg';

    // Check memory cache first
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(`img_cache_${btoa(src)}`);
      if (cached) {
        imageCache.set(src, cached);
        return cached;
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Start caching process and return original URL
    cacheImage(src);
    return src;
  }, [cacheImage]);

  // Aggressively cache all images immediately on mount
  useEffect(() => {
    if (galleryImages.length > 0) {
      // Cache all images in parallel for instant display
      galleryImages.forEach(async (image) => {
        const imageUrl = getGalleryImageUrl(image);
        if (imageUrl && imageUrl !== '/placeholder-image.jpg') {
          await cacheImage(imageUrl);
        }
      });
    }
  }, []); // Only run once on mount

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const url = `${API_BASE_URL}/gallery${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const newImages = data.data || [];

          // Only update if data actually changed
          const currentImagesStr = JSON.stringify(galleryImages);
          const newImagesStr = JSON.stringify(newImages);

          if (currentImagesStr !== newImagesStr) {
            setGalleryImages(newImages);

            // Cache in both memory and localStorage
            const cacheKey = `gallery_${selectedCategory}`;
            galleryMemoryCache.set(cacheKey, newImages);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(newImages));
            } catch {
              // Storage full, ignore
            }
          }
        } else {
          throw new Error(data.message || 'Failed to fetch gallery');
        }
      } catch (err) {
        setError(err.message);
        // Keep cached images, don't overwrite them
      }
    };

    fetchGallery();
  }, [selectedCategory]); // Remove galleryImages dependency to prevent infinite loop

  // Update gallery images when category changes
  useEffect(() => {
    const cachedImages = getCachedGallery(selectedCategory);
    if (cachedImages.length > 0) {
      setGalleryImages(cachedImages);
    }
  }, [selectedCategory]);

  // Cache new gallery images when data changes
  useEffect(() => {
    if (galleryImages.length > 0) {
      // Cache all new images in parallel for instant display
      galleryImages.forEach(async (image) => {
        const imageUrl = getGalleryImageUrl(image);
        if (imageUrl && imageUrl !== '/placeholder-image.jpg') {
          await cacheImage(imageUrl);
        }
      });
    }
  }, [galleryImages, cacheImage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-2 sm:px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 text-center">
            Gallery
          </h1>
        </div>
      </div>

      {/* Category Filter */}
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

      {/* Remove loading state - always show content immediately */}

      {/* Error State */}
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

      {/* Gallery Grid */}
      {/* Gallery Content - Always show immediately */}
      <div className="max-w-full mx-auto px-2 sm:px-4 py-8 gallery-container">
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 min-[900px]:grid-cols-3 xl:grid-cols-4 gap-8 gallery-grid">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="bg-white shadow-2xl hover:shadow-2xl transition-all duration-300 gallery-card transform hover:-translate-y-2"
                style={{
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 aspect-ratio-container m-3">
                  <img
                    src={getCachedImageUrl(getGalleryImageUrl(image))}
                    alt={image.title}
                    className="w-full h-full object-cover gallery-image"
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    style={{
                      imageRendering: 'auto',
                      transform: 'translateZ(0)', // Force hardware acceleration
                      willChange: 'auto',
                      opacity: 1, // Always visible, no fade
                      transition: 'none' // No transition delays
                    }}
                    onLoad={(e) => {
                      // Remove any loading effects immediately
                      e.target.style.opacity = '1';
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
                      {image.title}
                    </h3>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-base text-gray-500 font-medium">
                        {image.category}
                      </p>
                      {image.featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                          Unggulan
                        </span>
                      )}
                    </div>


                    {image.description && (
                      <p className="text-base text-gray-600 mt-3 line-clamp-2 leading-relaxed mb-3">
                        {image.description}
                      </p>
                    )}

                    {/* Upload Date - Kanan Bawah */}
                    <div className="flex justify-end mt-3">
                      <p className="text-xs text-gray-500">
                        {image.created_at ?
                          new Date(image.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) :
                          new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Galeri
              </h3>
              <p className="text-gray-500">
                {selectedCategory === 'all'
                  ? 'Belum ada gambar yang tersedia di galeri.'
                  : `Belum ada gambar untuk kategori "${selectedCategory}".`
                }
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Gallery;