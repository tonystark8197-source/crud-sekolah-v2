import { useState, useEffect, useCallback } from 'react';
import {
  clearAllGalleryCache,
  cacheGalleryData,
  getCachedGalleryData,
  initializeGalleryCache
} from '../utils/cacheUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Initialize cache system
initializeGalleryCache();

// Memory cache untuk gallery
const galleryMemoryCache = new Map();

// Helper function to get correct image URL for gallery items
const getGalleryImageUrl = (galleryItem) => {
  if (!galleryItem || !galleryItem.image_url) {
    console.log('No image_url for gallery item:', galleryItem?.title);
    return '/images/school-building.jpg'; // Use existing image as placeholder
  }

  const imageUrl = galleryItem.image_url;
  console.log('Processing gallery image URL:', imageUrl, 'for item:', galleryItem.title);

  // If it's already a full URL from backend (http://localhost:8000/images/gallery/), convert to frontend path
  if (imageUrl.startsWith('http://localhost:8000/images/gallery/')) {
    const filename = imageUrl.split('/').pop();
    const frontendPath = `/images/gallery/${filename}`;
    console.log('Converting backend URL to frontend path:', frontendPath);
    return frontendPath;
  }

  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    console.log('Using full URL:', imageUrl);
    return imageUrl;
  }

  // If it's /images/gallery path (frontend public format), use directly
  if (imageUrl.startsWith('/images/gallery/')) {
    console.log('Using frontend public gallery path:', imageUrl);
    return imageUrl; // Direct access from frontend public
  }

  // If it's uploads/images/gallery path (old backend format), add base URL
  if (imageUrl.startsWith('/uploads/images/gallery/')) {
    const fullUrl = `http://localhost:8000${imageUrl}?t=${Date.now()}`;
    console.log('Using gallery uploads path:', fullUrl);
    return fullUrl;
  }

  // If it's uploads/images path (news format), add base URL
  if (imageUrl.startsWith('/uploads/images/')) {
    const fullUrl = `http://localhost:8000${imageUrl}?t=${Date.now()}`;
    console.log('Using uploads path:', fullUrl);
    return fullUrl;
  }

  // If it's a relative path starting with /storage/ (old format), add base URL
  if (imageUrl.startsWith('/storage/')) {
    const fullUrl = `http://localhost:8000${imageUrl}`;
    console.log('Using storage path:', fullUrl);
    return fullUrl;
  }

  // If it's a relative path starting with storage/, add base URL with slash
  if (imageUrl.startsWith('storage/')) {
    const fullUrl = `http://localhost:8000/${imageUrl}`;
    console.log('Using relative storage path:', fullUrl);
    return fullUrl;
  }

  // Default fallback
  console.log('Using fallback for:', imageUrl);
  return '/images/school-building.jpg'; // Use existing image as placeholder
};

// Global instant cache for gallery
if (typeof window !== 'undefined') {
  window.__GALLERY_CACHE__ = window.__GALLERY_CACHE__ || new Map();
}

// Use utility function for getting cached data
const getCachedGalleryImages = (category, featured) => {
  return getCachedGalleryData(category, featured);
};

export const useGallery = (category = 'all', featured = false) => {
  // Initialize with cached data immediately - NO loading state
  const [images, setImages] = useState(() => getCachedGalleryImages(category, featured));
  const [error, setError] = useState(null);

  // Always return loading as false for instant display
  const loading = false;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (category && category !== 'all') {
          params.append('category', category);
        }
        if (featured) {
          params.append('featured', 'true');
        }

        const url = `${API_BASE_URL}/gallery${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Transform data untuk memastikan path gambar konsisten
          const transformedImages = (data.data || []).map(image => {
            const correctImageUrl = getGalleryImageUrl(image);
            return {
              ...image,
              url: correctImageUrl,
              path: correctImageUrl,
              image_url: correctImageUrl
            };
          });

          // Only update if data actually changed
          const currentStr = JSON.stringify(images);
          const newStr = JSON.stringify(transformedImages);

          if (currentStr !== newStr) {
            setImages(transformedImages);

            // Cache using utility function
            cacheGalleryData(category, featured, transformedImages);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch gallery');
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError(err.message);
        // Don't clear images on error, keep cached data
      }
    };

    // Fetch in background without affecting UI
    fetchGallery();
  }, [category, featured]); // Remove images dependency to prevent infinite loop

  return { images, loading, error };
};

export const useFeaturedGallery = () => {
  return useGallery('all', true);
};

export const useCarouselGallery = (refreshTrigger = 0) => {
  // Initialize with cached data (memory first, then localStorage)
  const getCachedCarouselImages = () => {
    try {
      // Check memory cache first
      if (galleryMemoryCache.has('carouselImages')) {
        return galleryMemoryCache.get('carouselImages');
      }

      // Then check localStorage
      const cached = localStorage.getItem('carouselImages');
      if (cached) {
        const parsedImages = JSON.parse(cached);
        // Store in memory cache for faster access
        galleryMemoryCache.set('carouselImages', parsedImages);
        return parsedImages;
      }
    } catch (error) {
      // Silent error handling
    }
    return [];
  };

  const cachedImages = getCachedCarouselImages();
  const [images, setImages] = useState(cachedImages);
  const [error, setError] = useState(null);

  // Always return loading as false for instant display
  const loading = false;

  const fetchCarouselImages = useCallback(async () => {
    try {
      setError(null);
      // Don't set loading to true since we already have cached data

      const response = await fetch(`${API_BASE_URL}/gallery/carousel`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform data untuk memastikan path gambar sesuai dengan admin
        const transformedImages = data.data.map(image => {
          const correctImageUrl = getGalleryImageUrl(image);
          return {
            ...image,
            // Pastikan path gambar konsisten dengan admin gallery
            url: correctImageUrl,
            path: correctImageUrl,
            image_url: correctImageUrl
          };
        });

        // Only update if images actually changed
        const currentImagesStr = JSON.stringify(images);
        const newImagesStr = JSON.stringify(transformedImages);

        if (currentImagesStr !== newImagesStr) {
          setImages(transformedImages);

          // Cache in both memory and localStorage
          galleryMemoryCache.set('carouselImages', transformedImages);
          localStorage.setItem('carouselImages', JSON.stringify(transformedImages));
        }
      } else {
        throw new Error(data.message || 'Failed to fetch carousel images');
      }
    } catch (err) {
      setError(err.message);
      // Keep cached images, don't overwrite them
    }
    // No finally block needed since we don't set loading to false
  }, [images]); // Add dependency array for useCallback

  // If no cached data, immediately fetch from API
  useEffect(() => {
    if (images.length === 0) {
      fetchCarouselImages();
    }
  }, [fetchCarouselImages]); // Only run once on mount

  useEffect(() => {
    fetchCarouselImages();
  }, [refreshTrigger, fetchCarouselImages]);

  // Return function untuk refresh manual
  const refreshCarousel = () => {
    fetchCarouselImages();
  };

  return { images, loading, error, refreshCarousel };
};
