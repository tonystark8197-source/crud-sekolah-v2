import { useState, useEffect } from 'react';
import { Card, Button, ToggleSwitch } from '../ui';
import { api } from '../../services/api';
import Swal from 'sweetalert2';
import ErrorBoundary from '../ui/ErrorBoundary';

// Memory cache untuk social media data
const socialMediaMemoryCache = new Map();

// Cache untuk social media data
const getCachedSocialMediaData = () => {
  try {
    // Check memory cache first
    if (socialMediaMemoryCache.has('socialMediaData')) {
      return socialMediaMemoryCache.get('socialMediaData');
    }

    // Then check localStorage
    const cached = localStorage.getItem('socialMediaData');
    if (cached) {
      const parsedData = JSON.parse(cached);
      socialMediaMemoryCache.set('socialMediaData', parsedData);
      return parsedData;
    }
  } catch {
    // Silent error handling
  }

  // Return empty array instead of null to always show table
  return [];
};

const SocialMediaSettings = () => {
  // Initialize with cached data - always show table immediately
  const cachedSocialMedia = getCachedSocialMediaData();
  const [socialMedia, setSocialMedia] = useState(cachedSocialMedia);

  // Form switching states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  const [selectedSocial, setSelectedSocial] = useState(null);
  const [formData, setFormData] = useState({
    platform: '',
    name: '',
    url: '',
    icon_class: '',
    icon_color: '#6b7280', // Default gray color instead of black
    text_color: '#374151', // Default dark gray for text
    is_active: false, // Default nonaktif untuk data baru
    sort_order: 0
  });
  const [errors, setErrors] = useState({});

  // Selection states for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAllItems, setSelectAllItems] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Predefined social media platforms
  const platformOptions = [
    { value: 'email', label: 'Email', icon: 'fas fa-envelope', color: '#6b7280' },
    { value: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877f2' },
    { value: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
    { value: 'twitter', label: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2' },
    { value: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0077b5' },
    { value: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366' },
    { value: 'telegram', label: 'Telegram', icon: 'fab fa-telegram-plane', color: '#0088cc' }
  ];

  // Fetch social media data from API
  const fetchSocialMedia = async () => {
    try {
      const response = await api.get('/admin/social-media');
      if (response.data.success) {
        const socialMediaData = response.data.data || [];
        setSocialMedia(socialMediaData);

        // Save to cache
        socialMediaMemoryCache.set('socialMediaData', socialMediaData);
        localStorage.setItem('socialMediaData', JSON.stringify(socialMediaData));

        // Also update navbar cache
        localStorage.setItem('socialMedia', JSON.stringify(socialMediaData.filter(item => item.is_active)));

        // Dispatch event to update navbar
        window.dispatchEvent(new CustomEvent('socialMediaUpdated', {
          detail: socialMediaData
        }));
      }
    } catch (err) {
      console.error('Error fetching social media:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSocialMedia();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      platform: '',
      name: '',
      url: '',
      icon_class: '',
      icon_color: '#6b7280', // Default gray color instead of black
      text_color: '#374151', // Default dark gray for text
      is_active: false, // Default nonaktif untuk data baru
      sort_order: 0
    });
    setErrors({});
  };

  // Handle form operations
  const openForm = (mode, socialItem = null) => {
    setFormMode(mode);
    setSelectedSocial(socialItem);

    if (mode === 'edit' && socialItem) {
      setFormData({
        platform: socialItem.platform || '',
        name: socialItem.name || '',
        url: socialItem.url || '',
        icon_class: socialItem.icon_class || '',
        icon_color: socialItem.icon_color || '#6b7280',
        text_color: socialItem.text_color || '#374151',
        is_active: socialItem.is_active !== undefined ? socialItem.is_active : false,
        sort_order: socialItem.sort_order || 0
      });
    } else if (mode === 'create') {
      resetForm();
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedSocial(null);
    resetForm();
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAllItems(checked);
    if (checked) {
      setSelectedItems(socialMedia.map(item => item.id));
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
    if (selectedItems.length === socialMedia.length && socialMedia.length > 0) {
      setSelectAllItems(true);
    } else {
      setSelectAllItems(false);
    }
  }, [selectedItems, socialMedia]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedItems.length} item yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await Promise.all(selectedItems.map(id => api.delete(`/admin/social-media/${id}`)));
        
        await fetchSocialMedia();
        setSelectedItems([]);
        setSelectAllItems(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${selectedItems.length} item berhasil dihapus!`,
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        });

        // Trigger custom event to update TopNav
        window.dispatchEvent(new CustomEvent('socialMediaUpdated'));
      } catch (err) {
        console.error('Error deleting items:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-fill icon class and color when platform is selected
      if (name === 'platform') {
        const platform = platformOptions.find(p => p.value === value);
        if (platform) {
          setFormData(prev => ({
            ...prev,
            name: platform.label,
            icon_class: platform.icon,
            icon_color: platform.color,
            text_color: '#374151', // Default dark gray for text instead of black
            url: '',
            is_active: false // Tetap nonaktif saat platform dipilih
          }));
        }
      }
      
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

    if (!formData.platform) newErrors.platform = 'Platform harus dipilih';
    if (isFieldEmpty(formData.name)) newErrors.name = 'Nama harus diisi';
    if (isFieldEmpty(formData.url)) newErrors.url = 'URL harus diisi';
    if (isFieldEmpty(formData.icon_class)) newErrors.icon_class = 'Icon class harus diisi';

    // Validate URL format
    if (formData.url) {
      if (formData.platform === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.url)) {
          newErrors.url = 'Format email tidak valid';
        }
      } else {
        try {
          new URL(formData.url);
        } catch {
          newErrors.url = 'Format URL tidak valid';
        }
      }
    }

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
      title: isCreate ? 'Menyimpan Social Media...' : 'Memperbarui Social Media...',
      text: isCreate ? `Sedang menyimpan "${formData.name}"` : `Sedang memperbarui "${formData.name}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let response;

      if (formMode === 'create') {
        response = await api.post('/admin/social-media', formData);
      } else if (formMode === 'edit') {
        response = await api.put(`/admin/social-media/${selectedSocial.id}`, formData);
      }

      // Update social media list immediately without API call for faster response
      if (isCreate) {
        // For create, get the new item from response and add to list
        const newSocialItem = response.data.data;
        setSocialMedia(prevData => [...prevData, newSocialItem]);
        console.log('✅ Added new social media item to list:', newSocialItem.name);
      } else {
        // For update, get updated item from response and replace in list
        const updatedSocialItem = response.data.data;
        setSocialMedia(prevData =>
          prevData.map(item =>
            item.id === updatedSocialItem.id ? updatedSocialItem : item
          )
        );
        console.log('✅ Updated social media item in list:', updatedSocialItem.name);
      }

      // Update navbar cache immediately
      const currentData = isCreate
        ? [...socialMedia, response.data.data]
        : socialMedia.map(item => item.id === response.data.data.id ? response.data.data : item);
      const activeItems = currentData.filter(item => item.is_active);
      localStorage.setItem('socialMedia', JSON.stringify(activeItems));

      // Close form and show success
      closeForm();

      Swal.fire({
        icon: 'success',
        title: isCreate ? 'Berhasil Menyimpan!' : 'Berhasil Memperbarui!',
        text: isCreate ? `Social media "${formData.name}" berhasil ditambahkan` : `Social media "${formData.name}" berhasil diperbarui`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      // Trigger custom event to update TopNav
      window.dispatchEvent(new CustomEvent('socialMediaUpdated', {
        detail: { socialMediaData: activeItems }
      }));
    } catch (err) {
      console.error('Error saving social media:', err);
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

  const handleDelete = async (socialItem) => {
    if (!socialItem || !socialItem.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Data sosial media tidak valid',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus "${socialItem.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setDeletingId(socialItem.id);
    setIsDeleting(true);

    try {
      const response = await api.delete(`/admin/social-media/${socialItem.id}`);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Sosial media berhasil dihapus!',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        });
        await fetchSocialMedia();

        // Trigger custom event to update TopNav
        window.dispatchEvent(new CustomEvent('socialMediaUpdated'));
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
        errorMessage = 'Sosial media tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        await fetchSocialMedia();
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
      setIsDeleting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
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
                    Kelola Sosial Media
                  </button>
                ) : (
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Kelola Sosial Media
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
                    {formMode === 'create' ? 'Tambah Sosial Media' : 'Edit Sosial Media'}
                  </span>
                </div>
              </li>
            )}
          </ol>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Sosial Media</h1>
            <p className="text-gray-600 mt-2">
              Kelola semua akun sosial media sekolah
              {socialMedia.length > 0 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {socialMedia.length} akun
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
              Tambah Sosial Media
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

        {/* Social Media Table - Only show when not in form mode */}
        {!showForm && (
          <Card padding="lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Sosial Media</h3>
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleBulkDelete}
                    variant="danger"
                    size="sm"
                    disabled={isDeleting}
                    icon={
                      isDeleting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )
                    }
                  >
                    {isDeleting ? 'Menghapus...' : `Hapus ${selectedItems.length} Item`}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedItems([]);
                      setSelectAllItems(false);
                    }}
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>

            {socialMedia.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <p>Belum ada sosial media yang ditambahkan</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urutan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {socialMedia.map((item, index) => (
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

                        {/* Platform */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div
                                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: item.icon_color || '#6b7280' }}
                              >
                                <i className={`${item.icon_class} text-sm`}></i>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.platform}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* URL */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                              title={item.url}
                            >
                              {item.url}
                            </a>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.is_active ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Nonaktif
                            </span>
                          )}
                        </td>

                        {/* Sort Order */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.sort_order}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => openForm('edit', item)}
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting || (isDeleting && deletingId === item.id)}
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
                              disabled={isSubmitting || (isDeleting && deletingId === item.id)}
                              icon={
                                (isDeleting && deletingId === item.id) ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )
                              }
                            >
                              {(isDeleting && deletingId === item.id) ? 'Menghapus...' : 'Hapus'}
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
                {formMode === 'create' ? 'Tambah Sosial Media Baru' : 'Edit Sosial Media'}
              </h3>
              <p className="text-gray-600 mt-1">
                {formMode === 'create' ? 'Tambahkan akun sosial media baru' : 'Edit informasi sosial media'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform and Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform */}
                <div className="space-y-2">
                  <label htmlFor="social-platform" className="block text-sm font-semibold text-gray-800">
                    Platform *
                  </label>
                  <select
                    id="social-platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.platform ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Platform</option>
                    {platformOptions.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  {errors.platform && (
                    <p className="text-red-600 text-sm">{errors.platform}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="social-name" className="block text-sm font-semibold text-gray-800">
                    Nama Tampilan *
                  </label>
                  <input
                    type="text"
                    id="social-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Nama yang akan ditampilkan"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label htmlFor="social-url" className="block text-sm font-semibold text-gray-800">
                  URL/Link *
                </label>
                <input
                  type="text"
                  id="social-url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.url ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder={formData.platform === 'email' ? 'email@sekolah.com' : 'https://platform.com/username'}
                />
                {errors.url && (
                  <p className="text-red-600 text-sm">{errors.url}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.platform === 'email' ? 'Masukkan alamat email' : 'Masukkan URL lengkap dengan https://'}
                </p>
              </div>

              {/* Icon Class and Colors Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Icon Class */}
                <div className="space-y-2">
                  <label htmlFor="social-icon" className="block text-sm font-semibold text-gray-800">
                    Icon Class *
                  </label>
                  <input
                    type="text"
                    id="social-icon"
                    name="icon_class"
                    value={formData.icon_class}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.icon_class ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="fab fa-facebook-f"
                  />
                  {errors.icon_class && (
                    <p className="text-red-600 text-sm">{errors.icon_class}</p>
                  )}
                  <p className="text-xs text-gray-500">Font Awesome icon class</p>
                </div>

                {/* Icon Color */}
                <div className="space-y-2">
                  <label htmlFor="social-icon-color" className="block text-sm font-semibold text-gray-800">
                    Warna Icon
                  </label>
                  <input
                    type="color"
                    id="social-icon-color"
                    name="icon_color"
                    value={formData.icon_color}
                    onChange={handleInputChange}
                    className="w-full h-12 px-2 py-1 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <label htmlFor="social-text-color" className="block text-sm font-semibold text-gray-800">
                    Warna Teks
                  </label>
                  <input
                    type="color"
                    id="social-text-color"
                    name="text_color"
                    value={formData.text_color}
                    onChange={handleInputChange}
                    className="w-full h-12 px-2 py-1 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Sort Order and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sort Order */}
                <div className="space-y-2">
                  <label htmlFor="social-sort" className="block text-sm font-semibold text-gray-800">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    id="social-sort"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Angka kecil akan tampil lebih dulu</p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Status
                  </label>
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        id="social-is-active"
                        checked={formData.is_active}
                        onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        theme="light"
                        disabled={isSubmitting}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {formData.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formData.is_active ? 'Tampilkan di website' : 'Sembunyikan dari website'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {formData.platform && formData.name && formData.icon_class && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Preview
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border">
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white mr-3"
                        style={{ backgroundColor: formData.icon_color }}
                      >
                        <i className={`${formData.icon_class} text-sm`}></i>
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: formData.text_color }}
                      >
                        {formData.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  onClick={closeForm}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  icon={isSubmitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                >
                  {isSubmitting ? 'Menyimpan...' : (formMode === 'create' ? 'Simpan' : 'Update')}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SocialMediaSettings;
