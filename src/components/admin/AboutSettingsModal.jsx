import { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { api } from '../../services/api';

const AboutSettingsModal = ({ isOpen, onClose, aboutItem, onSave }) => {
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    content: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  // Icon options
  const iconOptions = [
    { value: 'eye', label: '👁️ Eye (Visi)', icon: '👁️' },
    { value: 'target', label: '🎯 Target (Misi)', icon: '🎯' },
    { value: 'book-open', label: '📖 Book (Sejarah)', icon: '📖' },
    { value: 'heart', label: '❤️ Heart (Nilai)', icon: '❤️' },
    { value: 'star', label: '⭐ Star (Prestasi)', icon: '⭐' },
    { value: 'users', label: '👥 Users (Tim)', icon: '👥' },
    { value: 'award', label: '🏆 Award (Penghargaan)', icon: '🏆' },
    { value: 'lightbulb', label: '💡 Lightbulb (Inovasi)', icon: '💡' }
  ];

  useEffect(() => {
    if (aboutItem) {
      setFormData({
        section_key: aboutItem.section_key || '',
        title: aboutItem.title || '',
        content: aboutItem.content || '',
        description: aboutItem.description || '',
        icon: aboutItem.icon || '',
        sort_order: aboutItem.sort_order || 0,
        is_active: aboutItem.is_active !== undefined ? aboutItem.is_active : true
      });
    } else {
      // Reset form for new item
      setFormData({
        section_key: '',
        title: '',
        content: '',
        description: '',
        icon: '',
        sort_order: 0,
        is_active: true
      });
    }
  }, [aboutItem, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (aboutItem?.id) {
        // Update existing
        response = await api.put(`/admin/about-settings/${aboutItem.id}`, formData);
      } else {
        // Create new
        response = await api.post('/admin/about-settings', formData);
      }

      if (response.data.success) {
        showAlert('success', response.data.message || 'Pengaturan about berhasil disimpan');
        onSave(response.data.data);
        onClose();
      } else {
        showAlert('error', response.data.message || 'Gagal menyimpan pengaturan about');
      }
    } catch (error) {
      console.error('Error saving about settings:', error);
      showAlert('error', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {aboutItem ? 'Edit Pengaturan About' : 'Tambah Pengaturan About'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Key *
            </label>
            <input
              type="text"
              name="section_key"
              value={formData.section_key}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., vision, mission, history"
              required
              disabled={aboutItem?.id} // Disable editing for existing items
            />
            <p className="text-xs text-gray-500 mt-1">
              Kunci unik untuk section ini (tidak dapat diubah setelah dibuat)
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Visi Sekolah"
              required
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <select
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Icon</option>
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan konten lengkap..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi singkat tentang section ini..."
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutan Tampil
            </label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Aktif (tampilkan di halaman about)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutSettingsModal;
