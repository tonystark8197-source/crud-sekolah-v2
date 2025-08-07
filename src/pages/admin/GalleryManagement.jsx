import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { Card, Button } from '../../components/ui';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { api } from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { clearAllGalleryCache, forceRefreshGalleryData } from '../../utils/cacheUtils';
import Swal from 'sweetalert2';

// Memory cache untuk gallery data
const galleryMemoryCache = new Map();

// Global instant cache for admin gallery
if (typeof window !== 'undefined') {
  window.__ADMIN_GALLERY_CACHE__ = window.__ADMIN_GALLERY_CACHE__ || [];
}

// Clear all gallery cache using utility function
const clearGalleryCache = () => {
  clearAllGalleryCache();

  // Also clear admin-specific cache
  window.__ADMIN_GALLERY_CACHE__ = [];
  galleryMemoryCache.delete('galleryData');

  try {
    localStorage.removeItem('galleryData');
  } catch {
    // Silent error handling
  }
};

// Cache untuk gallery data - INSTANT access
const getCachedGalleryData = () => {
  // Check global cache first (instant)
  if (window.__ADMIN_GALLERY_CACHE__ && window.__ADMIN_GALLERY_CACHE__.length > 0) {
    console.log('⚡ INSTANT admin gallery from global cache');
    return window.__ADMIN_GALLERY_CACHE__;
  }

  try {
    // Check memory cache
    if (galleryMemoryCache.has('galleryData')) {
      const cached = galleryMemoryCache.get('galleryData');
      window.__ADMIN_GALLERY_CACHE__ = cached;
      return cached;
    }

    // Check localStorage
    const cached = localStorage.getItem('galleryData');
    if (cached) {
      const parsedData = JSON.parse(cached);
      galleryMemoryCache.set('galleryData', parsedData);
      window.__ADMIN_GALLERY_CACHE__ = parsedData;
      console.log('🚀 FAST admin gallery from localStorage');
      return parsedData;
    }
  } catch {
    // Silent error handling
  }

  // Return empty array for instant table display
  return [];
};

const GalleryManagement = () => {
  const { isAuthenticated, isLoading: authLoading, redirectToLogin, } = useAdminAuth();

  // Initialize with cached data - always show table immediately
  const cachedImages = getCachedGalleryData();
  const [images, setImages] = useState(cachedImages);

  // Form switching states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Kegiatan Rutin',
    featured: false,
    carousel_pinned: false,
    image: null
  });

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // ID of item being deleted
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Selection states for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAllItems, setSelectAllItems] = useState(false);

  const categories = ['Kegiatan Rutin', 'Kegiatan Khusus', 'Prestasi', 'Fasilitas', 'Ekstrakurikuler'];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  // Helper function to get image URL
  const getImageUrl = (galleryItem) => {
    if (!galleryItem || !galleryItem.image_url) {
      return '/images/placeholder.svg';
    }

    const imageUrl = galleryItem.image_url;

    // If it's already /images/gallery path, use directly
    if (imageUrl.startsWith('/images/gallery/')) {
      return imageUrl;
    }

    // If it's full URL, extract filename and use relative path
    if (imageUrl.includes('/images/gallery/')) {
      const filename = imageUrl.split('/').pop();
      return `/images/gallery/${filename}`;
    }

    // Default fallback
    return '/images/placeholder.svg';
  };

  // Fetch gallery data from API with instant caching
  const fetchGallery = useCallback(async (forceClear = false) => {
    try {
      // Clear cache if requested (for force refresh)
      if (forceClear) {
        clearGalleryCache();
      }

      const response = await api.get('/gallery/admin/all');
      if (response.data.success) {
        const galleryData = response.data.data || [];

        // Always update with fresh data from API
        setImages(galleryData);

        // Save to ALL caches immediately
        window.__ADMIN_GALLERY_CACHE__ = galleryData;
        galleryMemoryCache.set('galleryData', galleryData);
        try {
          localStorage.setItem('galleryData', JSON.stringify(galleryData));

          // Also update public gallery cache to keep consistency
          const publicCacheKey = 'gallery_all_false';
          window.__GALLERY_CACHE__ = window.__GALLERY_CACHE__ || new Map();
          window.__GALLERY_CACHE__.set(publicCacheKey, galleryData);
          localStorage.setItem(publicCacheKey, JSON.stringify(galleryData));
        } catch {
          // Storage full, ignore
        }
        console.log('✅ Admin gallery cached:', galleryData.length, 'images');
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      // Don't clear images on error, keep cached data
    }
  }, []); // Remove images dependency to prevent infinite loop

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchGallery();
    }
  }, [isAuthenticated, authLoading, fetchGallery]);

  // Refresh data when page becomes visible or focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log('🔄 Page became visible, refreshing gallery data...');
        fetchGallery(true); // Force clear cache when page becomes visible
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        console.log('🔄 Window focused, refreshing gallery data...');
        fetchGallery(true); // Force clear cache when window is focused
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, fetchGallery]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      featured: false,
      carousel_pinned: false,
      image: null
    });
    setImagePreview(null);
    setErrors({});
  };

  // Handle form operations
  const openForm = (mode, imageItem = null) => {
    setFormMode(mode);
    setSelectedImage(imageItem);

    if (mode === 'edit' && imageItem) {
      setFormData({
        title: imageItem.title || '',
        description: imageItem.description || '',
        category: imageItem.category || '',
        featured: imageItem.featured || false,
        carousel_pinned: imageItem.carousel_pinned || false,
        image: 'preserve'
      });
      setImagePreview(getImageUrl(imageItem));
    } else if (mode === 'create') {
      resetForm();
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedImage(null);
    resetForm();
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAllItems(checked);
    if (checked) {
      setSelectedItems(images.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
      setSelectAllItems(false);
    }
  };

  // Update selectAll when individual items change
  useEffect(() => {
    if (selectedItems.length === images.length && images.length > 0) {
      setSelectAllItems(true);
    } else {
      setSelectAllItems(false);
    }
  }, [selectedItems, images]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedItems.length} gambar yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map(id => api.delete(`/gallery/${id}`)));

        await fetchGallery(true); // Force clear cache
        setSelectedItems([]);
        setSelectAllItems(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil Menghapus!',
          text: `${selectedItems.length} gambar berhasil dihapus`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } catch (err) {
        console.error('Error deleting items:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  // Handle image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Format file tidak valid. Gunakan JPG, PNG, GIF, atau WebP'
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Ukuran file terlalu besar. Maksimal 5MB'
      }));
      return;
    }

    // Clear previous errors
    setErrors(prev => ({ ...prev, image: null }));

    // Set file to form data
    setFormData(prev => ({ ...prev, image: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'file') {
      handleImageChange(e);
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  // Helper function to safely check if a string field is empty
  const isFieldEmpty = (field) => {
    return !field || typeof field !== 'string' || !field.trim();
  };

  const validateForm = () => {
    const newErrors = {};

    if (isFieldEmpty(formData.title)) newErrors.title = 'Judul harus diisi';
    if (isFieldEmpty(formData.description)) newErrors.description = 'Deskripsi harus diisi';
    if (!formData.category) newErrors.category = 'Kategori harus dipilih';
    if (formMode === 'create' && !formData.image) newErrors.image = 'Gambar harus diupload';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 Form submission started', {
      formMode,
      formData: {
        ...formData,
        image: formData.image instanceof File ? `File: ${formData.image.name}` : formData.image
      }
    });

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);

    // Show loading alert
    const isCreate = formMode === 'create';
    Swal.fire({
      title: isCreate ? 'Mengupload Gambar...' : 'Memperbarui Gambar...',
      text: isCreate ? `Sedang mengupload "${formData.title}"` : `Sedang memperbarui "${formData.title}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category || 'Kegiatan Rutin');
      submitData.append('featured', formData.featured ? 'true' : 'false');
      submitData.append('carousel_pinned', formData.carousel_pinned ? 'true' : 'false');
      submitData.append('is_active', 'true');
      submitData.append('sort_order', '0');

      console.log('📝 Form data prepared:', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        featured: formData.featured,
        carousel_pinned: formData.carousel_pinned
      });

      let response;

      if (formMode === 'create') {
        // Handle image upload for create
        if (formData.image && formData.image instanceof File) {
          submitData.append('image', formData.image);
          console.log('📷 Image added to form data:', formData.image.name);
        }

        console.log('📤 Sending POST request to /gallery');
        response = await api.post('/gallery', submitData);
        console.log('✅ Create response:', response.data);
      } else if (formMode === 'edit') {
        // Handle image changes for edit
        if (formData.image && formData.image instanceof File) {
          // New image uploaded
          submitData.append('image', formData.image);
          console.log('📷 New image added for edit:', formData.image.name);
        } else if (formData.image === null) {
          // Image was deleted
          submitData.append('delete_image', '1');
          console.log('🗑️ Image marked for deletion');
        }

        submitData.append('_method', 'PUT');
        console.log(`📤 Sending PUT request to /gallery/${selectedImage.id}`);
        response = await api.post(`/gallery/${selectedImage.id}`, submitData);
        console.log('✅ Update response:', response.data);
      }

      // Force refresh gallery data from API to ensure consistency
      console.log('🔄 Refreshing gallery data from API...');
      await forceRefreshGalleryData(); // Use utility function
      await fetchGallery(true); // Force clear cache

      // Clear any cached image previews
      setImagePreview(null);

      // Close form and show success
      closeForm();

      console.log('🎉 Form submission successful');
      Swal.fire({
        icon: 'success',
        title: isCreate ? 'Berhasil Upload!' : 'Berhasil Update!',
        text: isCreate ? `Gambar "${formData.title}" berhasil diupload` : `Gambar "${formData.title}" berhasil diperbarui`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('❌ Error saving gallery:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data';
      console.log('💬 Showing error message:', errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Form submission completed');
    }
  };

  const handleDelete = async (galleryItem) => {
    if (!galleryItem || !galleryItem.id) {
      console.error('❌ Invalid gallery item for deletion:', galleryItem);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Data gambar tidak valid',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    console.log('🗑️ Delete request for gallery item:', galleryItem);

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus gambar "${galleryItem.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      console.log('❌ Delete operation cancelled by user');
      return;
    }

    setIsDeleting(galleryItem.id);
    console.log(`🚀 Starting delete process for ID: ${galleryItem.id}`);

    // Show loading alert
    Swal.fire({
      title: 'Menghapus Gambar...',
      text: `Sedang menghapus "${galleryItem.title}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      console.log(`📤 Sending DELETE request to /gallery/${galleryItem.id}`);
      const response = await api.delete(`/gallery/${galleryItem.id}`);
      console.log('✅ Delete response:', response.data);

      if (response.data.success) {
        console.log('🎉 Delete operation successful');

        // Force refresh gallery data from API to ensure consistency
        await forceRefreshGalleryData(); // Use utility function
        await fetchGallery(true); // Force clear cache

        console.log('✅ Gallery data refreshed after delete');

        // Show success alert with auto close
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Menghapus!',
          text: `Gambar "${galleryItem.title}" berhasil dihapus`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        console.log('⚠️ Delete response indicates failure:', response.data);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: response.data.message || response.data.error || 'Terjadi kesalahan',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      console.error('Delete error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      let errorMessage = 'Terjadi kesalahan saat menghapus data';

      if (err.response?.status === 404) {
        errorMessage = 'Gambar tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        await fetchGallery(true); // Force clear cache
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error: ' + (err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan server');
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || errorMessage;
      }

      console.log('💬 Showing delete error message:', errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsDeleting(null);
      console.log('🏁 Delete operation completed');
    }
  };

  // Only redirect if not authenticated, no loading screen
  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {showForm ? (
                    <button
                      onClick={() => setShowForm(false)}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                    >
                      Kelola Gallery
                    </button>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Kelola Gallery
                    </span>
                  )}
                </div>
              </li>
              {showForm && (
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {formMode === 'create' ? 'Tambah Gambar' : 'Edit Gambar'}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Gallery</h1>
              <p className="text-gray-600 mt-2">
                Kelola semua gambar dan foto kegiatan sekolah
                {images.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {images.length} gambar
                  </span>
                )}
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {selectedItems.length} dipilih
                  </span>
                )}
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => openForm('create')}
                variant="primary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Tambah Gambar
              </Button>
            )}
            {showForm && (
              <Button
                onClick={closeForm}
                variant="outline"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Kembali ke Daftar
              </Button>
            )}
          </div>

          {/* Gallery Table - Only show when not in form mode */}
          {!showForm && (
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Gambar</h3>
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleBulkDelete}
                      variant="danger"
                      size="sm"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      }
                    >
                      Hapus {selectedItems.length} Item
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItems([]);
                        setSelectAllItems(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </div>

              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Belum ada gambar yang diupload</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectAllItems}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          Gambar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {images.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {/* Checkbox */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* Number */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {index + 1}
                            </div>
                          </td>

                          {/* Image */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={getImageUrl(item)}
                              alt={item.title || 'Gallery image'}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </td>

                          {/* Title */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title || '-'}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs" title={item.description}>
                                {item.description}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category || '-'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {item.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Featured
                                </span>
                              )}
                              {item.carousel_pinned && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                  </svg>
                                  Carousel
                                </span>
                              )}
                              {!item.featured && !item.carousel_pinned && (
                                <span className="text-sm text-gray-500">Normal</span>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => openForm('edit', item)}
                                variant="outline"
                                size="sm"
                                icon={
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDelete(item)}
                                variant="danger"
                                size="sm"
                                loading={isDeleting === item.id}
                                disabled={isDeleting === item.id}
                                icon={
                                  isDeleting === item.id ? null : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )
                                }
                              >
                                {isDeleting === item.id ? 'Menghapus...' : 'Hapus'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Create/Edit Form - Show when in form mode */}
          {showForm && (
            <Card padding="lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formMode === 'create' ? 'Tambah Gambar Baru' : 'Edit Gambar'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {formMode === 'create' ? 'Upload gambar baru untuk gallery sekolah' : 'Edit informasi gambar'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="gallery-title" className="block text-sm font-semibold text-gray-800">
                    Judul Gambar *
                  </label>
                  <input
                    type="text"
                    id="gallery-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Masukkan judul gambar"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="gallery-description" className="block text-sm font-semibold text-gray-800">
                    Deskripsi *
                  </label>
                  <textarea
                    id="gallery-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Masukkan deskripsi gambar"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="gallery-category" className="block text-sm font-semibold text-gray-800">
                    Kategori *
                  </label>
                  <select
                    id="gallery-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm">{errors.category}</p>
                  )}
                </div>

                {/* Status Options */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-800">
                    Status Gambar
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        Gambar Unggulan
                      </label>
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          id="gallery-featured"
                          checked={formData.featured}
                          onChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                          theme="light"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-gray-600">
                          {formData.featured ? 'Tampilkan sebagai gambar unggulan' : 'Gambar biasa'}
                        </span>
                      </div>
                    </div>

                    {/* Carousel Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-800">
                        Carousel Utama
                      </label>
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          id="gallery-carousel"
                          checked={formData.carousel_pinned}
                          onChange={(checked) => setFormData(prev => ({ ...prev, carousel_pinned: checked }))}
                          theme="light"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-gray-600">
                          {formData.carousel_pinned ? 'Tampilkan di carousel utama' : 'Tidak di carousel'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Gambar {formMode === 'create' ? '*' : ''}
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                            // Reset file input
                            const fileInput = document.getElementById('gallery-image-upload');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formMode === 'edit' && formData.image === 'preserve' ? 'Gambar saat ini' : 'Gambar baru dipilih'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="gallery-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      </div>
                      <input
                        id="gallery-image-upload"
                        name="image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleInputChange}
                      />
                    </label>
                  </div>
                  {errors.image && (
                    <p className="text-red-600 text-sm">{errors.image}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={closeForm}
                    variant="outline"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (formMode === 'create' ? 'Uploading...' : 'Updating...')
                      : (formMode === 'create' ? 'Upload' : 'Update')
                    }
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
};

export default GalleryManagement;
