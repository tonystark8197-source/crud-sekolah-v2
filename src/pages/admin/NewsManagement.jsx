import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { Card, Button } from '../../components/ui';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { api } from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Swal from 'sweetalert2';

// Memory cache untuk news data
const newsMemoryCache = new Map();



// Cache untuk news data
const getCachedNewsData = () => {
  try {
    // Check memory cache first
    if (newsMemoryCache.has('newsData')) {
      return newsMemoryCache.get('newsData');
    }

    // Then check localStorage
    const cached = localStorage.getItem('newsData');
    if (cached) {
      const parsedData = JSON.parse(cached);
      newsMemoryCache.set('newsData', parsedData);
      return parsedData;
    }
  } catch {
    // Silent error handling
  }

  // Return empty array instead of null to always show table
  return [];
};

const NewsManagement = () => {
  const { isAuthenticated, isLoading: authLoading, redirectToLogin, user } = useAdminAuth();

  // Initialize with cached data - always show table immediately
  const cachedNews = getCachedNewsData();
  const [news, setNews] = useState(cachedNews);

  // Form switching states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    status: 'draft',
    featured: false,
    image: null,
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Selection states for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAllItems, setSelectAllItems] = useState(false);

  // Loading states for individual actions
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Prestasi', 'Akademik', 'Kegiatan', 'Pengumuman', 'Fasilitas'];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  // Helper function to get image URL
  const getImageUrl = (newsItem) => {
    if (!newsItem || !newsItem.image_url) {
      return '/placeholder-news.jpg';
    }

    const imageUrl = newsItem.image_url;

    // If it's already /images/news path, use directly
    if (imageUrl.startsWith('/images/news/')) {
      return imageUrl;
    }

    // If it's full URL, extract filename and use relative path
    if (imageUrl.includes('/images/news/')) {
      const filename = imageUrl.split('/').pop();
      return `/images/news/${filename}`;
    }

    // Default fallback
    return '/placeholder-news.jpg';
  };

  // INSTANT image display - ultra-fast caching
  const getCachedImageUrl = (newsItem) => {
    const originalUrl = getImageUrl(newsItem);
    if (!originalUrl || originalUrl === '/placeholder-news.jpg') {
      return originalUrl;
    }

    // INSTANT: Check global cache first (fastest possible)
    if (window.__NEWS_IMAGE_CACHE__ && window.__NEWS_IMAGE_CACHE__.has(originalUrl)) {
      const cached = window.__NEWS_IMAGE_CACHE__.get(originalUrl);
      return cached;
    }

    // FAST: Check localStorage immediately with simple key
    const fastKey = `__FAST_IMG_${btoa(originalUrl).slice(0, 15)}`;
    try {
      const fastCache = localStorage.getItem(fastKey);
      if (fastCache) {
        // Cache in global for next access
        window.__NEWS_IMAGE_CACHE__.set(originalUrl, fastCache);
        return fastCache;
      }
    } catch {
      // Silent
    }

    // BACKGROUND: Start caching and return original
    cacheImageInstantly(originalUrl);
    return originalUrl;
  };

  // Instant background caching
  const cacheImageInstantly = async (src) => {
    if (!src) return;

    try {
      const response = await fetch(src);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Cache in global immediately
        window.__NEWS_IMAGE_CACHE__.set(src, blobUrl);

        // Cache in localStorage with simple key
        const fastKey = `__FAST_IMG_${btoa(src).slice(0, 15)}`;

        // Convert to base64 for localStorage
        const reader = new FileReader();
        reader.onload = () => {
          try {
            localStorage.setItem(fastKey, reader.result);

          } catch {
            // Storage full - clear old cache
            const keys = Object.keys(localStorage);
            const imageKeys = keys.filter(key => key.startsWith('__FAST_IMG_'));
            if (imageKeys.length > 30) {
              imageKeys.slice(0, 10).forEach(key => localStorage.removeItem(key));
              try {
                localStorage.setItem(fastKey, reader.result);
              } catch {
                // Still full, ignore
              }
            }
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch {
      // Silent error handling
    }
  };



  // Fetch news data from API
  const fetchNews = useCallback(async () => {
    try {
      const response = await api.get('/news/admin/all');

      if (response.data.success) {
        const newsData = response.data.data || [];
        setNews(newsData);

        // Save to cache
        newsMemoryCache.set('newsData', newsData);
        localStorage.setItem('newsData', JSON.stringify(newsData));

      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
    }
  }, []);

  // Load data on component mount with instant cache preparation
  useEffect(() => {
    // Load cached news immediately for instant display
    const cachedNews = getCachedNewsData();
    if (cachedNews.length > 0 && news.length === 0) {
      setNews(cachedNews);

    }

    // Fetch fresh data
    fetchNews();
  }, []);

  // INSTANT preload all images when news data changes
  useEffect(() => {
    if (news.length > 0) {

      // Preload all images instantly for immediate display
      news.forEach(async (newsItem) => {
        const imageUrl = getImageUrl(newsItem);
        if (imageUrl && imageUrl !== '/placeholder-news.jpg') {
          await cacheImageInstantly(imageUrl);
        }
      });
    }
  }, [news]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      author: user?.name || 'Admin',
      status: 'draft',
      featured: false,
      image: null,
      imageUrl: ''
    });
    setImagePreview(null);
    setErrors({});
  };

  // Handle form operations
  const openForm = (mode, newsItem = null) => {
    setFormMode(mode);
    setSelectedNews(newsItem);

    if (mode === 'edit' && newsItem) {
      // Handle author field
      let authorName = '';
      if (typeof newsItem.author === 'string') {
        authorName = newsItem.author;
      } else if (newsItem.author && newsItem.author.name) {
        authorName = newsItem.author.name;
      } else if (newsItem.author_name) {
        authorName = newsItem.author_name;
      }

      if (!authorName) {
        authorName = user?.name || 'Admin';
      }

      let oldImage = getImageUrl(newsItem);

      setFormData({
        title: newsItem.title || '',
        excerpt: newsItem.excerpt || '',
        content: newsItem.content || '',
        category: newsItem.category || '',
        author: authorName,
        status: newsItem.status || 'draft',
        featured: newsItem.featured || false,
        image: 'preserve',
        oldImage: oldImage,
        imageUrl: newsItem.image_url
      });
      setImagePreview(oldImage);
    } else if (mode === 'create') {
      resetForm();
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedNews(null);
    resetForm();
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAllItems(checked);
    if (checked) {
      setSelectedItems(news.map(item => item.id));
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
    if (selectedItems.length === news.length && news.length > 0) {
      setSelectAllItems(true);
    } else {
      setSelectAllItems(false);
    }
  }, [selectedItems, news]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedItems.length} berita yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map(id => api.delete(`/news/${id}`)));

        await fetchNews();
        setSelectedItems([]);
        setSelectAllItems(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${selectedItems.length} berita berhasil dihapus!`,
          confirmButtonColor: '#10B981',
          timer: 3000,
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
    const { name, value, type } = e.target;

    if (type === 'file') {
      handleImageChange(e);
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
    if (isFieldEmpty(formData.excerpt)) newErrors.excerpt = 'Ringkasan harus diisi';
    if (isFieldEmpty(formData.content)) newErrors.content = 'Konten harus diisi';
    if (!formData.category) newErrors.category = 'Kategori harus dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Show loading alert
    const isCreate = formMode === 'create';
    Swal.fire({
      title: isCreate ? 'Menyimpan Berita...' : 'Memperbarui Berita...',
      text: isCreate ? `Sedang menyimpan "${formData.title}"` : `Sedang memperbarui "${formData.title}"`,
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
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      submitData.append('author', formData.author || user?.name || 'Admin');
      submitData.append('status', formData.status);
      submitData.append('featured', formData.featured ? '1' : '0');

      let response;

      if (formMode === 'create') {
        // Handle image upload for create
        if (formData.image && formData.image instanceof File) {
          submitData.append('image', formData.image);

        }


        response = await api.post('/news', submitData);

      } else if (formMode === 'edit') {
        // Handle image changes for edit
        if (formData.image && formData.image instanceof File) {
          // New image uploaded
          submitData.append('image', formData.image);

        } else if (formData.image === null) {
          // Image was deleted
          submitData.append('delete_image', '1');

        }

        submitData.append('_method', 'PUT');

        response = await api.post(`/news/${selectedNews.id}`, submitData);

      }

      // Update news list immediately without API call for faster response


      if (isCreate) {
        // For create, get the new item from response and add to beginning
        const newNewsItem = response.data.data;
        setNews(prevNews => [newNewsItem, ...prevNews]);

      } else {
        // For update, get updated item from response and replace in list
        const updatedNewsItem = response.data.data;
        setNews(prevNews =>
          prevNews.map(item =>
            item.id === updatedNewsItem.id ? updatedNewsItem : item
          )
        );

      }

      // Clear any cached image previews
      setImagePreview(null);

      // Close form and show success
      closeForm();


      Swal.fire({
        icon: 'success',
        title: isCreate ? 'Berhasil Menyimpan!' : 'Berhasil Memperbarui!',
        text: isCreate ? `Berita "${formData.title}" berhasil dibuat` : `Berita "${formData.title}" berhasil diperbarui`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

    } catch (err) {
      console.error('❌ Error saving news:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.error || err.message || 'Terjadi kesalahan saat menyimpan data',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (newsItem) => {
    if (!newsItem || !newsItem.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Data berita tidak valid',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus berita "${newsItem.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setDeletingId(newsItem.id);

    // Show loading alert
    Swal.fire({
      title: 'Menghapus Berita...',
      text: `Sedang menghapus "${newsItem.title}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {

      const response = await api.delete(`/news/${newsItem.id}`);


      if (response.data.success) {
        await fetchNews();

        // Show success alert with auto close
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Menghapus!',
          text: `Berita "${newsItem.title}" berhasil dihapus`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: response.data.message || response.data.error || 'Terjadi kesalahan',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);

      let errorMessage = 'Terjadi kesalahan saat menghapus data';

      if (err.response?.status === 404) {
        errorMessage = 'Berita tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        await fetchNews();
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error: ' + (err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan server');
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || errorMessage;
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setDeletingId(null);
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
                      Kelola Berita
                    </button>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Kelola Berita
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
                      {formMode === 'create' ? 'Tambah Berita' : 'Edit Berita'}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Berita</h1>
              <p className="text-gray-600 mt-2">
                Kelola semua berita dan artikel sekolah
                {news.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {news.length} berita
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
                Tambah Berita
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

          {/* News Table - Only show when not in form mode */}
          {!showForm && (
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Berita</h3>
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

              {news.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Belum ada berita yang dibuat</p>
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
                      {news.map((item, index) => (
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
                            {item.image_url ? (
                              <img
                                src={getCachedImageUrl(item)}
                                alt={item.title || 'News image'}
                                className="w-12 h-12 rounded-lg object-cover"
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
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title || '-'}
                            </div>
                            {item.excerpt && (
                              <div className="text-sm text-gray-500 truncate max-w-xs" title={item.excerpt}>
                                {item.excerpt}
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
                            {item.status === 'published' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Draft
                              </span>
                            )}
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
                                loading={deletingId === item.id}
                                disabled={deletingId === item.id}
                                icon={
                                  deletingId === item.id ? null : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )
                                }
                              >
                                {deletingId === item.id ? 'Menghapus...' : 'Hapus'}
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
                  {formMode === 'create' ? 'Tambah Berita Baru' : 'Edit Berita'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {formMode === 'create' ? 'Buat berita baru untuk website sekolah' : 'Edit informasi berita'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="news-title" className="block text-sm font-semibold text-gray-800">
                    Judul Berita *
                  </label>
                  <input
                    type="text"
                    id="news-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Masukkan judul berita"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm">{errors.title}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <label htmlFor="news-excerpt" className="block text-sm font-semibold text-gray-800">
                    Ringkasan *
                  </label>
                  <textarea
                    id="news-excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.excerpt ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Masukkan ringkasan berita"
                  />
                  {errors.excerpt && (
                    <p className="text-red-600 text-sm">{errors.excerpt}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label htmlFor="news-content" className="block text-sm font-semibold text-gray-800">
                    Konten *
                  </label>
                  <textarea
                    id="news-content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={8}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.content ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Masukkan konten berita lengkap"
                  />
                  {errors.content && (
                    <p className="text-red-600 text-sm">{errors.content}</p>
                  )}
                </div>

                {/* Category and Author Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <label htmlFor="news-category" className="block text-sm font-semibold text-gray-800">
                      Kategori *
                    </label>
                    <select
                      id="news-category"
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

                  {/* Author */}
                  <div className="space-y-2">
                    <label htmlFor="news-author" className="block text-sm font-semibold text-gray-800">
                      Penulis
                    </label>
                    <input
                      type="text"
                      id="news-author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                      placeholder="Nama penulis"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="news-status" className="block text-sm font-semibold text-gray-800">
                    Status
                  </label>
                  <select
                    id="news-status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Featured Toggle Switch */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Berita Unggulan
                  </label>
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      id="news-featured"
                      checked={formData.featured}
                      onChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      theme="light"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.featured ? 'Tampilkan sebagai berita unggulan' : 'Berita biasa'}
                    </span>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Gambar
                  </label>

                  {/* Image Preview */}
                  {(imagePreview || formData.oldImage) && (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || formData.oldImage}
                          alt="Preview"
                          className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null, oldImage: null }));
                            // Reset file input
                            const fileInput = document.getElementById('news-image-upload');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {imagePreview ? 'Gambar baru dipilih' : 'Gambar saat ini'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="news-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                        id="news-image-upload"
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
                      ? (formMode === 'create' ? 'Menyimpan...' : 'Memperbarui...')
                      : (formMode === 'create' ? 'Simpan' : 'Update')
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

export default NewsManagement;
