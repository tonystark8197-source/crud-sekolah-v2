import React, { useState, useEffect } from 'react';
import { Card, Input, Textarea, Button } from '../ui';
import RichTextEditor from '../ui/RichTextEditor';
import ImagePositionSelector from '../ui/ImagePositionSelector';
import PreviewPage from '../ui/PreviewModal';
import GalleryImageSelector from '../ui/GalleryImageSelector';
import { api } from '../../services/api';
import Swal from 'sweetalert2';



const AboutSettings = () => {
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'

  // Form data state
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    content: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true,
    image: null,
    image_position: 'left',
    additional_data: ''
  });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [showGallerySelector, setShowGallerySelector] = useState(false);

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // Selection state for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Section types for dropdown
  const sectionTypes = [
    { key: 'vision', label: 'Visi' },
    { key: 'mission', label: 'Misi' },
    { key: 'history', label: 'Sejarah' },
    { key: 'values', label: 'Nilai-nilai' },
    { key: 'achievements', label: 'Prestasi' },
    { key: 'facilities', label: 'Fasilitas' },
    { key: 'programs', label: 'Program' },
    { key: 'staff', label: 'Tenaga Pendidik' }
  ];



  // Fetch settings
  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/about-settings');
      if (response.data.success) {
        // Sort by sort_order
        const sortedSettings = response.data.data.sort((a, b) => a.sort_order - b.sort_order);
        setSettings(sortedSettings);
      } else {
        setError('Gagal memuat pengaturan about');
      }
    } catch (err) {
      console.error('Error fetching about settings:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Anda tidak memiliki akses. Silakan login kembali.');
      } else if (err.message.includes('Route not found')) {
        setError('Route tidak ditemukan. Periksa konfigurasi backend.');
      } else {
        setError('Terjadi kesalahan saat memuat data: ' + err.message);
      }
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);



  // Reset form
  const resetForm = () => {
    setFormData({
      section_key: '',
      title: '',
      content: '',
      description: '',
      icon: '',
      sort_order: 0,
      is_active: true,
      image: null,
      image_position: 'left',
      additional_data: ''
    });
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  // Handle form operations
  const openForm = (mode, setting = null) => {
    setFormMode(mode);
    setSelectedSetting(setting);

    if (mode === 'edit' && setting) {
      setFormData({
        section_key: setting.section_key || '',
        title: setting.title || '',
        content: setting.content || '',
        description: setting.description || '',
        icon: setting.icon || '',
        sort_order: setting.sort_order || 0,
        is_active: setting.is_active || false,
        image: null,
        image_position: setting.image_position || 'left',
        additional_data: setting.additional_data ?
          (typeof setting.additional_data === 'object' ?
            JSON.stringify(setting.additional_data, null, 2) :
            setting.additional_data) : ''
      });

      // Set existing image URL for preview
      if (setting.image_url) {
        setExistingImageUrl(`http://localhost:8000${setting.image_url}`);
      } else {
        setExistingImageUrl(null);
      }
      setImagePreview(null);
    } else if (mode === 'create') {
      resetForm();
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedSetting(null);
    setFormMode('create');
    resetForm();
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));

      // Create preview for new image
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setExistingImageUrl(null); // Clear existing image when new one is selected
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle additional data JSON
  const handleAdditionalDataChange = (value) => {
    setFormData(prev => ({ ...prev, additional_data: value }));
  };

  // Handle gallery image selection for rich text editor
  const handleGalleryImageSelect = (imageUrl) => {
    // Insert image into rich text editor
    const img = `<img src="${imageUrl}" alt="Gallery Image" style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 0.5rem;" />`;
    const currentContent = formData.content || '';
    setFormData(prev => ({
      ...prev,
      content: currentContent + img
    }));
    setShowGallerySelector(false);
  };





  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append('section_key', formData.section_key);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('description', formData.description || '');
      submitData.append('icon', formData.icon || '');
      submitData.append('sort_order', formData.sort_order);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('image_position', formData.image_position || 'left');

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (formData.additional_data) {
        submitData.append('additional_data', formData.additional_data);
      }

      let response;
      if (formMode === 'create') {
        response = await api.post('/admin/about-settings', submitData);
      } else if (formMode === 'edit') {
        submitData.append('_method', 'PUT');
        response = await api.post(`/admin/about-settings/${selectedSetting.id}`, submitData);
      }

      if (response.data.success) {
        await fetchSettings();
        closeForm();

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: formMode === 'create' ? 'Pengaturan berhasil ditambahkan!' : 'Pengaturan berhasil diupdate!',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Handle delete with SweetAlert confirmation
  const handleDelete = async (setting) => {
    const result = await Swal.fire({
      title: 'Hapus Section?',
      text: `Apakah Anda yakin ingin menghapus section "${setting.title || setting.section_key}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Show loading
      Swal.fire({
        title: 'Menghapus...',
        text: 'Sedang menghapus section',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.delete(`/admin/about-settings/${setting.id}`);
      if (response.data.success) {
        await fetchSettings();

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Section berhasil dihapus',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (err) {
      console.error('Error deleting setting:', err);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(settings.map(setting => setting.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
      setSelectAll(false);
    }
  };

  // Update selectAll when individual items change
  useEffect(() => {
    if (selectedItems.length === settings.length && settings.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, settings]);

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
      try {
        // Delete each selected item
        await Promise.all(selectedItems.map(id => api.delete(`/admin/about-settings/${id}`)));

        await fetchSettings();
        setSelectedItems([]);
        setSelectAll(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${selectedItems.length} item berhasil dihapus!`,
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

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan About</h2>
          <p className="text-gray-600 mt-1">Kelola konten halaman About sekolah</p>
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
            Tambah Section
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Settings Table - Only show when not in form mode */}
      {!showForm && (
        <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Section About</h3>
            {selectedItems.length > 0 && (
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
            )}
          </div>

        {settings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Belum ada section yang dibuat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
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
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konten
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
                {settings.map((setting, index) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(setting.id)}
                        onChange={(e) => handleSelectItem(setting.id, e.target.checked)}
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
                      {setting.image_url ? (
                        <img
                          src={`http://localhost:8000${setting.image_url}`}
                          alt={setting.title || 'Section image'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* Section Key */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {setting.section_key.replace('_', ' ')}
                      </div>
                      {setting.icon && (
                        <div className="text-xs text-gray-500">
                          Icon: {setting.icon}
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {setting.title || '-'}
                      </div>
                      {setting.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={setting.description}>
                          {setting.description}
                        </div>
                      )}
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={setting.content}>
                        {setting.content ? setting.content.substring(0, 100) + (setting.content.length > 100 ? '...' : '') : '-'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {setting.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Tidak Aktif
                        </span>
                      )}
                    </td>

                    {/* Sort Order */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {setting.sort_order}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openForm('edit', setting)}
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
                          onClick={() => handleDelete(setting)}
                          variant="danger"
                          size="sm"
                          icon={
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          }
                        >
                          Hapus
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
              {formMode === 'create' ? 'Tambah Section About Baru' : 'Edit Section About'}
            </h3>
            <p className="text-gray-600 mt-1">
              {formMode === 'create' ? 'Buat section baru untuk halaman About' : 'Edit informasi section About'}
            </p>
          </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Section Key & Sort Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="section-key" className="block text-sm font-semibold text-gray-800">
                  Section Key *
                </label>
                {formMode === 'create' ? (
                  <select
                    id="section-key"
                    name="section_key"
                    value={formData.section_key}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-xl border-gray-200"
                    required
                  >
                    <option value="">Pilih Section</option>
                    {sectionTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="section-key"
                    name="section_key"
                    value={formData.section_key}
                    disabled
                    className="w-full px-4 py-3 border-2 rounded-xl bg-gray-50 border-gray-200"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="sort-order" className="block text-sm font-semibold text-gray-800">
                  Urutan
                </label>
                <input
                  type="number"
                  id="sort-order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 rounded-xl border-gray-200"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="about-title" className="block text-sm font-semibold text-gray-800">
                Judul *
              </label>
              <input
                type="text"
                id="about-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-200"
                placeholder="Masukkan judul section..."
                required
                autoComplete="off"
              />
            </div>

            {/* Description & Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                  Deskripsi
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl border-gray-200"
                  placeholder="Masukkan deskripsi singkat..."
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="icon" className="block text-sm font-semibold text-gray-800">
                  Icon
                </label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl border-gray-200"
                  placeholder="eye, target, book-open..."
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500">
                  Gunakan nama icon dari Heroicons atau Font Awesome
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Konten *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Masukkan konten section..."
                minHeight="300px"
                showPreview={true}
                onImageSelect={() => setShowGallerySelector(true)}
              />
              <p className="text-xs text-gray-500">
                Gunakan toolbar untuk memformat teks. Mendukung heading, bold, italic, list, link, dan gambar.
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Gambar
              </label>

              {/* Image Preview */}
              {(imagePreview || existingImageUrl) && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || existingImageUrl}
                      alt="Preview"
                      className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setExistingImageUrl(null);
                        setFormData(prev => ({ ...prev, image: null }));
                        // Reset file input
                        const fileInput = document.getElementById('about-image-upload');
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
                <label htmlFor="about-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 2MB)</p>
                  </div>
                  <input
                    id="about-image-upload"
                    name="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
            </div>

            {/* Image Position Selector */}
            <ImagePositionSelector
              value={formData.image_position}
              onChange={(position) => setFormData(prev => ({ ...prev, image_position: position }))}
            />

            {/* Additional Data */}
            <div className="space-y-2">
              <label htmlFor="additional-data" className="block text-sm font-semibold text-gray-800">
                Data Tambahan (JSON)
              </label>
              <textarea
                id="additional-data"
                name="additional_data"
                value={typeof formData.additional_data === 'object'
                  ? JSON.stringify(formData.additional_data, null, 2)
                  : formData.additional_data}
                onChange={(e) => handleAdditionalDataChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 font-mono text-sm"
                placeholder='{"key": "value", "array": ["item1", "item2"]}'
              />
              <p className="text-xs text-gray-500">
                Format JSON untuk data tambahan seperti statistik, timeline, dll.
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is-active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is-active" className="text-sm font-medium text-gray-700">
                Aktif
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{formMode === 'create' ? 'Simpan' : 'Update'}</span>
              </button>
            </div>
          </div>
        </form>
        </Card>
      )}

      {/* Preview Page */}
      <PreviewPage
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title}
        content={formData.content}
        description={formData.description}
        imageUrl={imagePreview || existingImageUrl}
        imagePosition={formData.image_position}
        sectionKey={formData.section_key}
      />

      {/* Gallery Image Selector */}
      <GalleryImageSelector
        isOpen={showGallerySelector}
        onClose={() => setShowGallerySelector(false)}
        onSelect={handleGalleryImageSelect}
      />
    </div>
  );
};

export default AboutSettings;
