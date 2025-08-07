import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { api } from '../../services/api';
import AboutSettings from '../../components/admin/AboutSettings';
import AuthErrorComponent from '../../components/auth/AuthErrorComponent';
import OperatingHoursSettings from '../../components/admin/OperatingHoursSettings';
import LogoManagement from '../../components/admin/LogoManagement';
import ThemeSettings from '../../components/admin/ThemeSettingsSimple';

// Validation schema
const schema = yup.object({
  schoolName: yup.string().required('Nama sekolah wajib diisi'),
  schoolShortName: yup.string().required('Nama singkat wajib diisi'),
  schoolAddress: yup.string().required('Alamat sekolah wajib diisi'),
  schoolPhone: yup.string().required('Nomor telepon wajib diisi'),
  schoolEmail: yup.string().email('Format email tidak valid').required('Email sekolah wajib diisi'),
  schoolWebsite: yup.string().url('Format website tidak valid').required('Website sekolah wajib diisi'),
  schoolPostalCode: yup.string(),
  principalName: yup.string().required('Nama kepala sekolah wajib diisi'),
  schoolMotto: yup.string().required('Motto sekolah wajib diisi'),
  schoolDescription: yup.string().required('Deskripsi sekolah wajib diisi'),
  websiteTitle: yup.string().required('Judul website wajib diisi')
});

// Get last active tab from localStorage
const getLastActiveTab = () => {
  try {
    const savedTab = localStorage.getItem('admin_settings_active_tab');
    if (savedTab && ['school-info', 'about', 'operating-hours', 'logo', 'theme'].includes(savedTab)) {
      console.log('📦 Restoring last active tab:', savedTab);
      return savedTab;
    }
  } catch (error) {
    console.warn('Failed to get last active tab:', error);
  }
  return 'school-info'; // Default tab
};

// Save active tab to localStorage
const saveActiveTab = (tabName) => {
  try {
    localStorage.setItem('admin_settings_active_tab', tabName);
    console.log('💾 Saved active tab:', tabName);
  } catch (error) {
    console.warn('Failed to save active tab:', error);
  }
};

const SettingsManagement = () => {
  // Initialize with last active tab from localStorage
  const [activeTab, setActiveTab] = useState(() => getLastActiveTab());
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Handle tab change with localStorage save
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    saveActiveTab(tabName);
  };

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors: formErrors },
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      schoolName: '',
      schoolShortName: '',
      schoolAddress: '',
      schoolPhone: '',
      schoolEmail: '',
      schoolWebsite: '',
      schoolPostalCode: '',
      principalName: '',
      schoolMotto: '',
      schoolDescription: '',
      websiteTitle: ''
    }
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings');

      if (response.data.success) {
        const data = response.data.data;
        setSettings(data);

        // Set form values
        Object.keys(data).forEach(key => {
          setValue(key, data[key] || '');
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.response?.status === 401) {
        setAuthError('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: 'Terjadi kesalahan saat memuat pengaturan sekolah.',
          confirmButtonColor: '#3B82F6'
        });
      }
    }
  }, [setValue]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle form submit
  const handleFormSubmit = async (data) => {
    try {
      setIsSaving(true);

      // Show loading alert
      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang menyimpan pengaturan sekolah',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await api.put('/settings', data);

      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...data }));

        // Update browser title immediately
        if (data.websiteTitle) {
          document.title = data.websiteTitle;
          const titleElement = document.getElementById('page-title');
          if (titleElement) titleElement.textContent = data.websiteTitle;
          console.log('✅ Page title updated to:', data.websiteTitle);
        }

        // Update localStorage with new settings
        const updatedSettings = { ...settings, ...data };
        localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('schoolSettingsUpdated', {
          detail: updatedSettings
        }));

        // Update favicon if logo exists
        try {
          const schoolSettings = localStorage.getItem('schoolSettings');
          if (schoolSettings) {
            const parsedSettings = JSON.parse(schoolSettings);
            if (parsedSettings.logoUrl && parsedSettings.logoUrl !== 'http://localhost:8000/images/logo/logo-school.png') {
              const favicon = document.getElementById('favicon');
              const appleTouchIcon = document.getElementById('apple-touch-icon');

              const timestampedUrl = parsedSettings.logoUrl.includes('?')
                ? `${parsedSettings.logoUrl}&t=${Date.now()}`
                : `${parsedSettings.logoUrl}?t=${Date.now()}`;

              if (favicon) favicon.href = timestampedUrl;
              if (appleTouchIcon) appleTouchIcon.href = timestampedUrl;
              console.log('✅ Favicon updated to:', timestampedUrl);
            }
          }
        } catch (error) {
          console.warn('Failed to update favicon:', error);
        }

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pengaturan sekolah telah disimpan dengan sukses. Title dan favicon telah diperbarui.',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);

      if (error.response?.status === 401) {
        setAuthError('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
          confirmButtonColor: '#EF4444'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authError) {
    return <AuthErrorComponent message={authError} />;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6 mt-4 max-[900px]:mt-8">
          {/* Header */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Pengaturan Sekolah</h1>
              <p className="text-black">Kelola informasi dan konfigurasi sekolah</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <nav className="flex min-[900px]:flex-row overflow-x-auto scrollbar-hide"
               style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <button
              onClick={() => handleTabChange('school-info')}
              className={`flex-shrink-0 py-4 px-4 min-[900px]:flex-1 min-[900px]:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'school-info'
                  ? 'border-gray-800 text-gray-800 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Informasi Sekolah</span>
              </div>
            </button>

            <button
              onClick={() => handleTabChange('about-settings')}
              className={`flex-shrink-0 py-4 px-4 min-[900px]:flex-1 min-[900px]:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'about-settings'
                  ? 'border-gray-800 text-gray-800 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tentang Sekolah</span>
              </div>
            </button>

            <button
              onClick={() => handleTabChange('theme')}
              className={`flex-shrink-0 py-4 px-4 min-[900px]:flex-1 min-[900px]:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'theme'
                  ? 'border-gray-800 text-gray-800 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                <span>Pengaturan Tema</span>
              </div>
            </button>

            <button
              onClick={() => handleTabChange('set-time')}
              className={`flex-shrink-0 py-4 px-4 min-[900px]:flex-1 min-[900px]:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'set-time'
                  ? 'border-gray-800 text-gray-800 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Set Time</span>
              </div>
            </button>

            <button
              onClick={() => handleTabChange('logo-management')}
              className={`flex-shrink-0 py-4 px-4 min-[900px]:flex-1 min-[900px]:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'logo-management'
                  ? 'border-gray-800 text-gray-800 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Manajemen Logo</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Informasi Sekolah Tab */}
          {activeTab === 'school-info' && (
              <Card padding="lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Informasi Sekolah</h2>
                    <p className="text-gray-600">Kelola data dasar dan kontak sekolah</p>
                  </div>
                </div>

                <form onSubmit={onSubmit(handleFormSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nama Sekolah Lengkap"
                        placeholder="SMA Negeri 1 Jakarta"
                        autoComplete="organization"
                        required
                        error={formErrors.schoolName?.message}
                        {...register('schoolName')}
                      />

                      <Input
                        label="Nama Singkat"
                        placeholder="SMAN 1 Jakarta"
                        autoComplete="off"
                        required
                        error={formErrors.schoolShortName?.message}
                        {...register('schoolShortName')}
                      />
                    </div>

                    <div className="mt-6">
                      <Textarea
                        label="Alamat Sekolah"
                        placeholder="Jl. Pendidikan No. 123, Menteng, Jakarta Pusat"
                        rows={3}
                        autoComplete="street-address"
                        required
                        error={formErrors.schoolAddress?.message}
                        {...register('schoolAddress')}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nomor Telepon"
                        placeholder="(021) 123-4567"
                        autoComplete="tel"
                        required
                        error={formErrors.schoolPhone?.message}
                        {...register('schoolPhone')}
                      />

                      <Input
                        label="Email Sekolah"
                        type="email"
                        placeholder="info@sekolah.sch.id"
                        autoComplete="email"
                        required
                        error={formErrors.schoolEmail?.message}
                        {...register('schoolEmail')}
                      />

                      <Input
                        label="Website Sekolah"
                        placeholder="https://www.sekolah.sch.id"
                        autoComplete="url"
                        required
                        error={formErrors.schoolWebsite?.message}
                        {...register('schoolWebsite')}
                      />

                      <Input
                        label="Kode Pos"
                        placeholder="10310"
                        autoComplete="postal-code"
                        error={formErrors.schoolPostalCode?.message}
                        {...register('schoolPostalCode')}
                      />
                    </div>
                  </div>

                  {/* Leadership & Identity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kepemimpinan & Identitas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nama Kepala Sekolah"
                        placeholder="Dr. Ahmad Suryadi, M.Pd"
                        autoComplete="name"
                        required
                        error={formErrors.principalName?.message}
                        {...register('principalName')}
                      />

                      <Input
                        label="Judul Website"
                        placeholder="SMA Negeri 1 Jakarta - Unggul dalam Prestasi"
                        autoComplete="off"
                        required
                        error={formErrors.websiteTitle?.message}
                        {...register('websiteTitle')}
                      />
                    </div>

                    <div className="mt-6">
                      <Textarea
                        label="Motto Sekolah"
                        placeholder="Berakhlak Mulia, Berprestasi Tinggi, Berbudaya Lingkungan"
                        rows={2}
                        autoComplete="off"
                        required
                        error={formErrors.schoolMotto?.message}
                        {...register('schoolMotto')}
                      />
                    </div>

                    <div className="mt-6">
                      <Textarea
                        label="Deskripsi Sekolah"
                        placeholder="Sekolah unggulan yang berkomitmen menghasilkan lulusan berkualitas dengan karakter yang kuat..."
                        rows={4}
                        autoComplete="off"
                        required
                        error={formErrors.schoolDescription?.message}
                        {...register('schoolDescription')}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSaving}
                      disabled={isSaving}
                      className="bg-gray-800 hover:bg-black text-white border-gray-800 hover:border-black focus:ring-gray-800"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                  </div>
                </form>
              </Card>
          )}

          {/* About Settings Tab */}
          {activeTab === 'about-settings' && (
              <AboutSettings />
          )}

          {/* Theme Settings Tab */}
          {activeTab === 'theme' && (
              <ThemeSettings />
          )}

          {/* Set Time Tab */}
          {activeTab === 'set-time' && (
              <OperatingHoursSettings />
          )}

          {/* Logo Management Tab */}
          {activeTab === 'logo-management' && (
              <LogoManagement />
          )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsManagement;