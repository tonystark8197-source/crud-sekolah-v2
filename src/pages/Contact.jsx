import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon,
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
      // Prepare data for backend
      const submitData = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject,
        message: data.message,
        category: data.subject // Map subject to category as expected by backend
      };

      // Send to Laravel backend
      const response = await fetch('http://localhost:8000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Form Data sent successfully:', result.data);
        toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');
        setShowSuccessMessage(true);
        reset();

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-4 mt-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Pesan Anda berhasil dikirim! Terima kasih telah menghubungi kami.</span>
          </div>
        </div>
      )}

      {/* Contact Form Section */}
      <section id="contact-form" className="relative min-h-screen bg-cover bg-center bg-no-repeat pb-20 -mx-4 sm:-mx-6 lg:-mx-8" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)'
      }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">


            <div className="grid lg:grid-cols-2 gap-12 mt-20">
          
          {/* Contact Form - Modern Design */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-center flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 mr-3 text-black" />
                <span className="text-black">Hubungi</span> <span className="text-blue-300 ml-2">Kami</span>
              </h2>
              <p className="text-blue-900 text-center mt-2 font-medium">Sampaikan pertanyaan atau saran Anda</p>
            </div>

            {/* Form */}
            <div className="p-8">
            
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Nama lengkap wajib diisi',
                      minLength: { value: 2, message: 'Nama minimal 2 karakter' }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-black rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email wajib diisi',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Format email tidak valid'
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-black rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="contoh@email.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Format nomor telepon tidak valid'
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-black rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="08xxxxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Kategori *
                  </label>
                  <select
                    {...register('subject', { required: 'Kategori wajib dipilih' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-black rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="" disabled style={{backgroundColor: '#3B82F6', color: 'white', fontWeight: 'bold'}}>Pilih Kategori</option>
                    <option value="Pendaftaran">Pendaftaran</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Administrasi">Administrasi</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {errors.subject && (
                    <p className="text-xs text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Pesan *
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Pesan wajib diisi',
                      minLength: { value: 10, message: 'Pesan minimal 10 karakter' }
                    })}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-black rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{
                    border: '2px solid white',
                    borderRadius: '0px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 6px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim Pesan...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Kirim Pesan
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* School Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
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
          </div>
        </div>
        </div>
        </div>
      </section>

      {/* Google Maps Section - Full Screen */}
      <section id="maps" className="relative w-screen min-h-screen bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8" style={{
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        width: '100vw'
      }}>
        {/* Title Section */}
        <div className="relative z-10 pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-blue-600">Lokasi</span> <span className="text-gray-600">Kami</span>
              </h3>
              <div className="w-32 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-gray-700 text-xl md:text-2xl font-semibold max-w-3xl mx-auto">
                Temukan lokasi {settings?.schoolName || 'SMK NEGERI TEMBARAK'} di peta
              </p>
            </div>
          </div>
        </div>

        {/* Map Container - Full Screen */}
        <div className="relative w-full flex-1" style={{ height: 'calc(100vh - 200px)' }}>
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
      </section>
    </div>
  );
};

export default Contact;
