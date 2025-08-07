import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button, Card, Input, Textarea } from '../ui';
import LogoImage from '../LogoImage';
import { fixLogoUrl, DEFAULT_LOGO_PATH } from '../../utils/logoUtils';
import Swal from 'sweetalert2';

const LogoManagement = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);

  // Edit modal states
  const [editModal, setEditModal] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [editForm, setEditForm] = useState({
    original_name: '',
    description: ''
  });

  // Load all logos
  const loadLogos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logos/all');
      if (response.data.success) {
        const logosData = response.data.data.map(logo => ({
          ...logo,
          url: fixLogoUrl(logo.url)
        }));
        setLogos(logosData);
      }
    } catch (error) {
      console.error('Error loading logos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: 'Terjadi kesalahan saat memuat daftar logo',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogos();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'File Tidak Valid',
          text: 'File harus berupa gambar (JPG, PNG, WebP, SVG)',
          confirmButtonColor: '#EF4444'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        Swal.fire({
          icon: 'error',
          title: 'File Terlalu Besar',
          text: 'Ukuran file maksimal 5MB',
          confirmButtonColor: '#EF4444'
        });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload new logo with SweetAlert
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      // Show loading
      Swal.fire({
        title: 'Mengupload...',
        text: 'Sedang mengupload logo baru',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formData = new FormData();
      formData.append('logo', selectedFile);
      formData.append('description', 'Logo sekolah diupload dari admin panel');

      const response = await api.post('/logo/upload', formData);

      if (response.data.success) {
        // Store uploaded logo data for preview
        const uploadedLogoData = {
          ...response.data.data,
          url: fixLogoUrl(response.data.data.url)
        };
        setUploadedLogo(uploadedLogoData);

        setSelectedFile(null);
        setPreviewUrl(null);

        // Reset file input
        const fileInput = document.getElementById('logo-file-input');
        if (fileInput) fileInput.value = '';

        // Reload logos
        await loadLogos();

        // Update localStorage with new logo URL
        const newLogoUrl = fixLogoUrl(response.data.data.url);
        const schoolSettings = JSON.parse(localStorage.getItem('schoolSettings') || '{}');
        schoolSettings.logoUrl = newLogoUrl;
        localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
        console.log('✅ Logo URL updated in localStorage:', newLogoUrl);

        // Update favicon immediately
        const favicon = document.getElementById('favicon');
        const appleTouchIcon = document.getElementById('apple-touch-icon');
        const timestampedUrl = `${newLogoUrl}?t=${Date.now()}`;

        if (favicon) favicon.href = timestampedUrl;
        if (appleTouchIcon) appleTouchIcon.href = timestampedUrl;
        console.log('✅ Favicon updated immediately:', timestampedUrl);

        // Dispatch event to update logo everywhere
        window.dispatchEvent(new CustomEvent('logoUpdated', {
          detail: { logoUrl: newLogoUrl }
        }));

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Logo berhasil diupload dan diaktifkan. Favicon telah diperbarui.',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Upload error:', error);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengupload logo',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setUploading(false);
    }
  };

  // Set logo as active with SweetAlert
  const handleSetActive = async (logoId) => {
    try {
      // Show loading
      Swal.fire({
        title: 'Mengaktifkan...',
        text: 'Sedang mengaktifkan logo',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.put(`/logos/${logoId}/activate`);
      if (response.data.success) {
        await loadLogos();

        // Get the activated logo URL
        const activatedLogo = logos.find(logo => logo.id === logoId);
        if (activatedLogo) {
          const newLogoUrl = fixLogoUrl(activatedLogo.url);

          // Update localStorage with new logo URL
          const schoolSettings = JSON.parse(localStorage.getItem('schoolSettings') || '{}');
          schoolSettings.logoUrl = newLogoUrl;
          localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
          console.log('✅ Logo URL updated in localStorage:', newLogoUrl);

          // Update favicon immediately
          const favicon = document.getElementById('favicon');
          const appleTouchIcon = document.getElementById('apple-touch-icon');
          const timestampedUrl = `${newLogoUrl}?t=${Date.now()}`;

          if (favicon) favicon.href = timestampedUrl;
          if (appleTouchIcon) appleTouchIcon.href = timestampedUrl;
          console.log('✅ Favicon updated immediately:', timestampedUrl);

          // Dispatch event to update logo everywhere
          window.dispatchEvent(new CustomEvent('logoUpdated', {
            detail: { logoUrl: newLogoUrl }
          }));
        }

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Logo berhasil diaktifkan. Favicon telah diperbarui.',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error activating logo:', error);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengaktifkan',
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengaktifkan logo',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Delete logo with SweetAlert
  const handleDelete = async (logoId, logoName) => {
    const result = await Swal.fire({
      title: 'Hapus Logo?',
      text: `Apakah Anda yakin ingin menghapus logo "${logoName}"?`,
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
        text: 'Sedang menghapus logo',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.delete(`/logos/${logoId}`);
      if (response.data.success) {
        await loadLogos();

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Logo berhasil dihapus',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error deleting logo:', error);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus logo',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Open edit modal
  const handleEdit = (logo) => {
    setEditingLogo(logo);
    setEditForm({
      original_name: logo.original_name || '',
      description: logo.description || ''
    });
    setEditModal(true);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditModal(false);
    setEditingLogo(null);
    setEditForm({
      original_name: '',
      description: ''
    });
  };

  // Save edit changes
  const handleSaveEdit = async () => {
    if (!editingLogo) return;

    try {
      // Show loading
      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang menyimpan perubahan',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.put(`/logos/${editingLogo.id}`, editForm);

      if (response.data.success) {
        await loadLogos();
        handleCloseEdit();

        // Show success
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Logo berhasil diperbarui',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error updating logo:', error);

      // Show error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan perubahan',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Logo</h2>
        <div className="text-sm text-gray-500">
          Total: {logos.length} logo
        </div>
      </div>



      {/* Upload Section */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Logo Baru</h3>
        
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <input
              id="logo-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('logo-file-input').click()}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              }
            >
              Pilih File Logo
            </Button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="flex items-center space-x-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-contain bg-gray-50 border rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{selectedFile?.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile?.size || 0)}</p>
              </div>
              <Button
                variant="primary"
                onClick={handleUpload}
                loading={uploading}
                disabled={uploading}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                }
              >
                {uploading ? 'Mengupload...' : 'Upload'}
              </Button>
            </div>
          )}

          {/* Upload Info */}
          <div className="text-xs text-gray-500">
            <p>Format yang didukung: JPG, PNG, WebP, SVG</p>
            <p>Ukuran maksimal: 5MB | Rekomendasi: 512x512px</p>
          </div>
        </div>
      </Card>

      {/* Recently Uploaded Logo Preview */}
      {uploadedLogo && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Baru Berhasil Diupload</h3>

          <div className="flex items-center justify-center py-6 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="mb-4">
                <LogoImage
                  src={uploadedLogo.url}
                  alt={uploadedLogo.original_name}
                  className="w-32 h-32 object-contain bg-white border rounded-lg mx-auto shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {uploadedLogo.original_name}
                </p>
                <p className="text-xs text-gray-500">
                  {uploadedLogo.formatted_size} • Diupload pada {new Date(uploadedLogo.uploaded_at).toLocaleDateString('id-ID')}
                </p>
                <div className="flex items-center justify-center space-x-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Logo Aktif & Favicon Diperbarui</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedLogo(null)}
                className="mt-4"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Tutup Preview
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Active Logo */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Aktif Saat Ini</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat logo...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            {logos.find(logo => logo.is_active) ? (
              <div className="text-center">
                <LogoImage
                  src={logos.find(logo => logo.is_active).url}
                  alt="Logo Aktif"
                  className="w-32 h-32 object-contain bg-gray-50 border rounded-lg mx-auto mb-4"
                />
                <p className="text-sm font-medium text-gray-900">
                  {logos.find(logo => logo.is_active).original_name}
                </p>
                <p className="text-xs text-gray-500">
                  {logos.find(logo => logo.is_active).formatted_size}
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Belum ada logo yang aktif</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Logo</h3>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editingLogo && (
              <div className="space-y-4">
                {/* Logo Preview */}
                <div className="flex justify-center">
                  <LogoImage
                    src={editingLogo.url}
                    alt={editingLogo.original_name}
                    className="w-24 h-24 object-contain bg-gray-50 border rounded-lg"
                  />
                </div>

                {/* Form Fields */}
                <div>
                  <Input
                    label="Nama File"
                    value={editForm.original_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, original_name: e.target.value }))}
                    placeholder="Masukkan nama file"
                  />
                </div>

                <div>
                  <Textarea
                    label="Deskripsi"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Masukkan deskripsi logo (opsional)"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseEdit}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveEdit}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoManagement;
