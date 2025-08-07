import React, { useState} from 'react';
import ImageSlider from '../components/ImageSlider';
import ImageModal from '../components/ImageModal';
import { useGallery, useFeaturedGallery } from '../hooks/useGallery';
import { useSchoolSettings } from '../hooks/useSchoolSettings';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use hooks for data fetching
  const { images, loading, error } = useGallery(selectedCategory);
  const { images: featuredImages, loading: featuredLoading } = useFeaturedGallery();
  const { settings, loading: settingsLoading } = useSchoolSettings();

  const categories = ['all', 'Fasilitas', 'Kegiatan', 'Prestasi', 'Ekstrakurikuler', 'Umum'];

  const openModal = (image, index = 0) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const goToNextImage = () => {
    const nextIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const goToPrevImage = () => {
    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };
  const getCategoryIcon = (category) => {
    const iconProps = "w-5 h-5";
    
    switch (category) {
      case 'Fasilitas':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Kegiatan':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zm-4 3v14h14V6H5zm2 3h10v2H7V9zm0 4h10v2H7v-2z" />
          </svg>
        );
      case 'Prestasi':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'Ekstrakurikuler':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Umum':
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Fasilitas': 'bg-blue-100 text-blue-800 border-blue-200',
      'Kegiatan': 'bg-green-100 text-green-800 border-green-200',
      'Prestasi': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Ekstrakurikuler': 'bg-purple-100 text-purple-800 border-purple-200',
      'Umum': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Galeri Kegiatan
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {settingsLoading ? 'Loading...' : `Dokumentasi kegiatan dan fasilitas ${settings?.schoolName || 'sekolah kami'}`}
          </p>
        </div>

        {/* Featured Images Slider */}
        {!featuredLoading && featuredImages.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Galeri Unggulan</h2>
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <ImageSlider images={featuredImages} onImageClick={openModal} />
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Filter Kategori</h3>
              <p className="text-gray-600">Pilih kategori untuk melihat galeri yang sesuai</p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => {
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-500'}>
                      {category === 'all' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      ) : (
                        getCategoryIcon(category)
                      )}
                    </span>
                    <span>{category === 'all' ? 'Semua' : category}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Category count */}
            <div className="text-center mt-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  {selectedCategory === 'all' 
                    ? `Menampilkan semua ${images.length} gambar`
                    : `Menampilkan ${images.length} gambar kategori ${selectedCategory}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Memuat galeri...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {!loading && (
          <>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden transform hover:-translate-y-2"
                    onClick={() => openModal(image, index)}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={image.url || image.image_url || image.path || '/images/gallery/gallery_1_1753243029.jpg'}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = '/images/gallery/gallery_1_1753243029.jpg';
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm border ${getCategoryColor(image.category)}`}>
                          {getCategoryIcon(image.category)}
                          <span>{image.category}</span>
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {image.featured && (
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Zoom Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">
                          {image.title}
                        </h3>
                        <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {image.description || 'Klik untuk melihat detail'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-medium">{image.uploaded_by || image.author || 'Admin'}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                          </svg>
                          <span className="text-xs">
                            {image.created_at
                              ? new Date(image.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'Baru'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-500 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 max-w-2xl mx-auto border border-gray-200 shadow-lg">
                  {/* Empty State Icon */}
                  <div className="relative mb-8">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-200 rounded-full animate-bounce shadow-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-200 rounded-full animate-pulse shadow-lg"></div>
                  </div>

                  {/* Empty State Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {selectedCategory === 'all' ? '🎨 Galeri Kosong' : `📂 Tidak Ada Gambar ${selectedCategory}`}
                    </h3>

                    <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                      {selectedCategory === 'all'
                        ? 'Belum ada gambar yang tersedia di galeri kami. Silakan kembali lagi nanti untuk melihat koleksi foto terbaru!'
                        : `Belum ada gambar untuk kategori "${selectedCategory}". Coba pilih kategori lain atau kembali lagi nanti.`
                      }
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Lihat Semua Kategori</span>
                      </button>

                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 hover:shadow-md transform hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mt-8">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-900 mb-1">💡 Informasi</h4>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          Admin sekolah dapat menambahkan foto kegiatan, fasilitas, dan prestasi melalui panel admin untuk ditampilkan di galeri ini. Galeri akan terus diperbarui dengan konten terbaru!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Image Modal */}
        <ImageModal
          isOpen={modalOpen}
          onClose={closeModal}
          image={selectedImage}
          images={images}
          currentIndex={currentImageIndex}
          onNext={goToNextImage}
          onPrev={goToPrevImage}
        />
      </div>
    </div>
  );
};

export default Gallery;
