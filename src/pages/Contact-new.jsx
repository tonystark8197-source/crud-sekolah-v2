import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Load settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('schoolSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form Data:', data);
      toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
      setShowSuccessMessage(true);
      reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch  {
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Hubungi Kami
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.
          </motion.p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div 
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-4 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Pesan Anda berhasil dikirim! Terima kasih telah menghubungi kami.</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Kirim Pesan
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Nama lengkap wajib diisi',
                      minLength: { value: 2, message: 'Nama minimal 2 karakter' }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email wajib diisi',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Format email tidak valid'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="contoh@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Format nomor telepon tidak valid'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek *
                </label>
                <select
                  {...register('subject', { required: 'Subjek wajib dipilih' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Pilih subjek pesan</option>
                  <option value="informasi-umum">Informasi Umum</option>
                  <option value="pendaftaran">Pendaftaran Siswa Baru</option>
                  <option value="akademik">Informasi Akademik</option>
                  <option value="fasilitas">Fasilitas Sekolah</option>
                  <option value="kerjasama">Kerjasama</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <textarea
                  {...register('message', { 
                    required: 'Pesan wajib diisi',
                    minLength: { value: 10, message: 'Pesan minimal 10 karakter' }
                  })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim...
                  </div>
                ) : (
                  'Kirim Pesan'
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* School Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Informasi Kontak
              </h3>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPinIcon className="h-6 w-6 text-blue-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Alamat</h4>
                    <p className="text-gray-600">
                      {settings?.schoolAddress || 'Jl. Pendidikan No. 123, Tembarak, Temanggung, Jawa Tengah 56264'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-green-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Telepon</h4>
                    <p className="text-gray-600">
                      {settings?.schoolPhone || '(0293) 123-4567'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-red-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">
                      {settings?.schoolEmail || 'info@smkntembarak.sch.id'}
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <GlobeAltIcon className="h-6 w-6 text-purple-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Website</h4>
                    <p className="text-gray-600">
                      {settings?.schoolWebsite || 'www.smkntembarak.sch.id'}
                    </p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-orange-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Jam Operasional</h4>
                    <div className="text-gray-600 space-y-1">
                      <p>Senin - Jumat: 07:00 - 16:00 WIB</p>
                      <p>Sabtu: 07:00 - 12:00 WIB</p>
                      <p>Minggu: Tutup</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Media Sosial
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href={settings?.facebookUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-blue-600 font-medium">Facebook</span>
                </a>

                <a
                  href={settings?.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors duration-200 group"
                >
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.876.807 1.366 1.958 1.366 3.255s-.49 2.448-1.297 3.323c-.876.876-2.027 1.366-3.324 1.366zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.876-.875-1.366-2.026-1.366-3.323s.49-2.448 1.297-3.323c.875-.876 2.026-1.366 3.323-1.366s2.448.49 3.323 1.297c.876.875 1.366 2.026 1.366 3.323s-.49 2.448-1.297 3.323c-.875.876-2.026 1.366-3.323 1.366z"/>
                  </svg>
                  <span className="text-pink-600 font-medium">Instagram</span>
                </a>

                <a
                  href={settings?.twitterUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                >
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-blue-400 font-medium">Twitter</span>
                </a>

                <a
                  href={settings?.youtubeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                >
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="text-red-600 font-medium">YouTube</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">Lokasi Kami</h3>
              <p className="text-gray-300 text-lg">
                Temukan lokasi {settings?.schoolName || 'SMK NEGERI TEMBARAK'} di peta
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              {/* Map Container */}
              <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${settings?.schoolName || 'SMK NEGERI TEMBARAK'} ${settings?.schoolAddress || 'Tembarak Temanggung'}`
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Lokasi ${settings?.schoolName || 'SMK NEGERI TEMBARAK'}`}
                  className="w-full h-full"
                />
              </div>

              {/* Map Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${settings?.schoolName || 'SMK NEGERI TEMBARAK'} ${settings?.schoolAddress || 'Tembarak Temanggung'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Buka di Google Maps
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${settings?.schoolName || 'SMK NEGERI TEMBARAK'} ${settings?.schoolAddress || 'Tembarak Temanggung'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Petunjuk Arah
                </a>
              </div>

              {/* Transportation Info */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="font-semibold text-blue-900 text-lg">Transportasi Umum</h4>
                  </div>
                  <p className="text-blue-700">
                    Dapat diakses dengan bus umum jurusan Temanggung - Tembarak atau angkutan desa setempat.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <BuildingOfficeIcon className="w-6 h-6 text-green-600 mr-3" />
                    <h4 className="font-semibold text-green-900 text-lg">Parkir Tersedia</h4>
                  </div>
                  <p className="text-green-700">
                    Area parkir luas tersedia untuk kendaraan roda dua dan roda empat dengan keamanan 24 jam.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
