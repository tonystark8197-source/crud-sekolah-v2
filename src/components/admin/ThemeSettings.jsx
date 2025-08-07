import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../ui';
import { FadeIn } from '../ui/AnimatedComponents';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const ThemeSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeSettings, setThemeSettings] = useState({
    topNavBg: '#1e40af',
    topNavText: '#ffffff',
    topNavIconColor: '#e5e7eb',
    mainNavBg: '#2563eb',
    mainNavText: '#ffffff',
    mainNavHover: '#3b82f6',
    socialMedia: {
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com'
    }
  });

  // Predefined options
  const componentOptions = [
    { value: 'home', label: 'Home Page' },
    { value: 'about', label: 'About Page' },
    { value: 'news', label: 'News Page' },
    { value: 'gallery', label: 'Gallery Page' },
    { value: 'contact', label: 'Contact Page' },
    { value: 'sidebar', label: 'Admin Sidebar' },
    { value: 'navbar', label: 'Navigation Bar' },
    { value: 'footer', label: 'Footer' },
    { value: 'global', label: 'Global Colors' }
  ];

  const elementOptions = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'header', label: 'Header' },
    { value: 'background', label: 'Background' },
    { value: 'card', label: 'Card' },
    { value: 'button', label: 'Button' },
    { value: 'text', label: 'Text' },
    { value: 'link', label: 'Link' },
    { value: 'border', label: 'Border' },
    { value: 'hover', label: 'Hover State' },
    { value: 'primary', label: 'Primary Element' },
    { value: 'secondary', label: 'Secondary Element' },
    { value: 'vision-mission', label: 'Vision Mission Section' }
  ];

  const colorTypeOptions = [
    { value: 'primary', label: 'Primary Color' },
    { value: 'secondary', label: 'Secondary Color' },
    { value: 'accent', label: 'Accent Color' },
    { value: 'background', label: 'Background Color' },
    { value: 'text', label: 'Text Color' },
    { value: 'border', label: 'Border Color' },
    { value: 'hover', label: 'Hover Color' },
    { value: 'main', label: 'Main Color' }
  ];

  const cssPropertyOptions = [
    { value: 'background-color', label: 'Background Color' },
    { value: 'color', label: 'Text Color' },
    { value: 'border-color', label: 'Border Color' },
    { value: 'box-shadow', label: 'Box Shadow' }
  ];

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/theme-settings');
      if (response.data.success) {
        setSettings(response.data.data);
      } else {
        setError('Gagal memuat pengaturan theme');
      }
    } catch (err) {
      console.error('Error fetching theme settings:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-[10001] transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Open modal
  const openModal = (mode, setting = null) => {
    setModalMode(mode);
    setSelectedSetting(setting);
    
    if (mode === 'edit' && setting) {
      setFormData({
        component_name: setting.component_name,
        element_name: setting.element_name,
        color_type: setting.color_type,
        color_value: setting.color_value,
        css_property: setting.css_property || 'background-color',
        description: setting.description || '',
        sort_order: setting.sort_order || 0,
        is_active: setting.is_active
      });
    } else if (mode === 'create') {
      setFormData({
        component_name: '',
        element_name: '',
        color_type: '',
        color_value: '#3B82F6',
        css_property: 'background-color',
        description: '',
        sort_order: settings.length,
        is_active: true
      });
    }
    
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSetting(null);
    setSubmitting(false);
    setDeleting(false);
    setError(null);
    setFormData({
      component_name: '',
      element_name: '',
      color_type: '',
      color_value: '#3B82F6',
      css_property: 'background-color',
      description: '',
      sort_order: 0,
      is_active: true
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!formData.component_name || !formData.element_name || !formData.color_type || !formData.color_value) {
        throw new Error('Semua field wajib harus diisi');
      }

      // Validate hex color format
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexPattern.test(formData.color_value)) {
        throw new Error('Format warna harus berupa hex color (contoh: #3B82F6)');
      }

      // Debug: log form data
      console.log('Submitting form data:', formData);

      let response;
      if (modalMode === 'create') {
        response = await api.post('/admin/theme-settings', formData);
      } else if (modalMode === 'edit') {
        console.log('Updating setting ID:', selectedSetting.id);
        response = await api.put(`/admin/theme-settings/${selectedSetting.id}`, formData);
      }

      if (response.data.success) {
        await fetchSettings();
        closeModal();
        
        // Show success message
        const message = modalMode === 'create' 
          ? 'Pengaturan theme berhasil ditambahkan!' 
          : 'Pengaturan theme berhasil diupdate!';
        
        // Create toast notification instead of alert
        showToast(message, 'success');
      } else {
        throw new Error(response.data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (deleting) return; // Prevent double deletion
    
    try {
      setDeleting(true);
      setError(null);
      
      const response = await api.delete(`/admin/theme-settings/${selectedSetting.id}`);
      if (response.data.success) {
        await fetchSettings();
        closeModal();
        showToast('Pengaturan theme berhasil dihapus!', 'success');
      } else {
        throw new Error(response.data.message || 'Gagal menghapus pengaturan');
      }
    } catch (err) {
      console.error('Error deleting setting:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Group settings by component
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.component_name]) {
      acc[setting.component_name] = [];
    }
    acc[setting.component_name].push(setting);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn direction="down" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan Theme</h2>
          <p className="text-gray-600 mt-1">Kelola warna dan tema aplikasi</p>
        </div>
        <Button
          onClick={() => openModal('create')}
          variant="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Tambah Warna
        </Button>
      </FadeIn>

      {/* Error Message */}
      {error && (
        <FadeIn className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </FadeIn>
      )}

      {/* Settings by Component */}
      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([componentName, componentSettings]) => (
          <FadeIn key={componentName} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {componentOptions.find(opt => opt.value === componentName)?.label || componentName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {componentSettings.map((setting) => (
                <div key={setting.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: setting.color_value }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {setting.element_name} - {setting.color_type}
                        </h4>
                        <p className="text-xs text-gray-500">{setting.color_value}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      setting.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {setting.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  {setting.description && (
                    <p className="text-xs text-gray-600 mb-3">{setting.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Order: {setting.sort_order}</span>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => openModal('edit', setting)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => openModal('delete', setting)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Inline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Tambah Pengaturan Warna' :
                 modalMode === 'edit' ? 'Edit Pengaturan Warna' :
                 'Hapus Pengaturan Warna'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    Apakah Anda yakin ingin menghapus pengaturan warna <strong>{selectedSetting?.component_name} - {selectedSetting?.element_name}</strong>?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      onClick={closeModal}
                      variant="outline"
                      disabled={deleting}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="danger"
                      disabled={deleting}
                      icon={deleting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                    >
                      {deleting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Component Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Komponen *
                      </label>
                      <select
                        id="component-name"
                        name="component_name"
                        value={formData.component_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Komponen</option>
                        {componentOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Element Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Elemen *
                      </label>
                      <select
                        id="element-name"
                        name="element_name"
                        value={formData.element_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Elemen</option>
                        {elementOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Color Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Warna *
                      </label>
                      <select
                        id="color-type"
                        name="color_type"
                        value={formData.color_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Tipe Warna</option>
                        {colorTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CSS Property */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSS Property
                      </label>
                      <select
                        id="css-property"
                        name="css_property"
                        value={formData.css_property}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {cssPropertyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warna
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          name="color_value"
                          value={formData.color_value}
                          onChange={handleInputChange}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          name="color_value"
                          value={formData.color_value}
                          onChange={handleInputChange}
                          placeholder="#3B82F6"
                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Sort Order */}
                    <Input
                      id="sort-order"
                      name="sort_order"
                      label="Urutan"
                      type="number"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  {/* Description */}
                  <Input
                    id="description"
                    name="description"
                    label="Deskripsi"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Deskripsi penggunaan warna ini"
                  />

                  {/* Is Active */}
                  <div className="flex items-center">
                    <input
                      id="is-active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is-active" className="ml-2 block text-sm text-gray-700">
                      Aktifkan pengaturan warna ini
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={closeModal}
                      variant="outline"
                      disabled={submitting}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      icon={submitting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                    >
                      {submitting ? 'Menyimpan...' : (modalMode === 'create' ? 'Tambah' : 'Update')}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
