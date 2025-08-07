import { useState, useEffect, useCallback } from 'react';
import { useCarouselGallery } from '../hooks/useGallery';
import { Link } from 'react-router-dom';
import Profil from './Profil';
import CTASection from '../components/CTASectionNew';


// Memory cache untuk gambar
const imageCache = new Map();
const preloadedImages = new Set();



const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0);
  const [currentNewsSlide, setCurrentNewsSlide] = useState(0);
  const {
    images: carouselGallery,
    refreshCarousel,
  } = useCarouselGallery(refreshTrigger);

  // News data - fetch directly from API like /news page
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          // Take only first 3 news items
          setNews(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      }
    };

    fetchNews();
  }, []);





  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const [isNewsAutoPlay, setIsNewsAutoPlay] = useState(true);

  // Preload gambar function
  const preloadImage = useCallback((src) => {
    if (!src || preloadedImages.has(src)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.onload = () => {
        imageCache.set(src, img);
        preloadedImages.add(src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Preload carousel images
  useEffect(() => {
    if (carouselGallery.length > 0) {
      carouselGallery.forEach(image => {
        const imageUrl = image.url || image.image_url || image.path;
        if (imageUrl) {
          preloadImage(imageUrl).catch(() => {
            // Silent fail untuk preload
          });
        }
      });
    }
  }, [carouselGallery, preloadImage]);

  // Auto carousel untuk main carousel - geser terus ke kanan
  useEffect(() => {
    if (!isAutoPlay || carouselGallery.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => prev + 1); // Geser terus ke kanan tanpa reset
    }, 6000); // Diperlambat dari 5 detik ke 6 detik

    return () => clearInterval(interval);
  }, [isAutoPlay, carouselGallery.length]);



  // Auto carousel untuk news section background
  useEffect(() => {
    if (!isNewsAutoPlay || !news || news.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex(prev => prev + 1); // Geser terus ke kanan
    }, 6000); // 6 detik untuk news background

    return () => clearInterval(interval);
  }, [news, isNewsAutoPlay]);

  // Auto carousel untuk news cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsSlide(prev => prev + 1); // Geser terus ke kanan
    }, 4000); // 4 detik untuk news cards carousel

    return () => clearInterval(interval);
  }, []);

  // Auto carousel untuk gallery cards - geser terus ke kanan
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGallerySlide(prev => {
        // Geser terus ke kanan: 0→1→2→3→4→5...
        return prev + 1;
      });
    }, 4000); // 4 detik untuk gallery carousel (diperlambat)

    return () => clearInterval(interval);
  }, []);

  // Global refresh & auto reload
  useEffect(() => {
    window.refreshCarousel = () => {
      refreshCarousel();
      setRefreshTrigger(prev => prev + 1);
    };
  }, [refreshCarousel]);

  const autoRefreshGallery = useCallback(() => {
    refreshCarousel();
    setRefreshTrigger(prev => prev + 1);
  }, [refreshCarousel]);

  useEffect(() => {
    const interval = setInterval(autoRefreshGallery, 60000);
    return () => clearInterval(interval);
  }, [autoRefreshGallery]);

  // Carousel navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => 
      prev === carouselGallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(prev => 
      prev === 0 ? carouselGallery.length - 1 : prev - 1
    );
  };

  // Default carousel data jika kosong
  const defaultCarouselData = [
    {
      id: 'default-1',
      title: 'SMK NEGERI TEMBARAK',
      description: 'Sekolah Menengah Kejuruan Negeri Tembarak - Membangun Generasi Unggul',
      url: '/images/school-building.jpg',
      image_url: '/images/school-building.jpg'
    }
  ];

  const carouselData = carouselGallery.length > 0 ? carouselGallery : defaultCarouselData;





  return (
    <div className="min-h-screen">
      <section className="relative h-screen overflow-hidden">
        <div className="relative w-full h-full">
          <div
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${(currentSlide % carouselData.length) * 100}%)` }}
          >
            {carouselData.map((slide, index) => {
              const imageUrl = slide.url || slide.image_url || slide.path;
              const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`) : null;

              return (
                <div
                  key={slide.id || index}
                  className="w-full h-full flex-shrink-0 relative"
                >
                  {fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt={slide.title || slide.name || 'Carousel Image'}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        console.error('Carousel image failed to load:', fullImageUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700"
                    style={{display: fullImageUrl ? 'none' : 'flex'}}
                  >
                    <div className="text-center text-white">
                      <div className="mb-6">
                        <svg className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                        </svg>
                      </div>
                      {/* Welcome Text */}
                      <p className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl font-medium mb-4 md:mb-6 opacity-90" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                        Welcome to
                      </p>

                      {/* School Name */}
                      <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9)'}}>
                        SMK N <span className="text-yellow-400">TEMBARAK</span>
                      </h2>

                      {/* Motto */}
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-90 max-w-3xl md:max-w-4xl mx-auto leading-relaxed">
                        Motto Sekolah
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      {/* Welcome Text */}
                      <p className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl font-medium mb-4 md:mb-6 opacity-90" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                        Welcome to
                      </p>

                      {/* School Name */}
                      <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9)'}}>
                        SMK N <span className="text-yellow-400">TEMBARAK</span>
                      </h1>

                      {/* Motto */}
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-90 max-w-3xl md:max-w-4xl mx-auto drop-shadow-md leading-relaxed">
                        Tiada Hari Tanpa Inovasi
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        {carouselData.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {carouselData.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 hidden min-[900px]:flex">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === (currentSlide % carouselData.length)
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50'
                }`}
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
              />
            ))}
          </div>
        )}
        </div>
      </section>
      <div style={{ backgroundColor: '#1e3a5f' }}>
        <Profil />
      </div>
      <section className="relative py-20 bg-white bg-opacity-5 overflow-hidden">
        {/* Background Image from Gallery */}
        <div className="absolute inset-0">
          {(() => {
            const galleryData = carouselGallery.length > 0 ? carouselGallery : [
              { id: 1, image_url: null },
              { id: 2, image_url: null },
              { id: 3, image_url: null }
            ];

            return galleryData.slice(0, 3).map((item, index) => {
              const imageUrl = item.url || item.image_url || item.path;
              const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`) : null;

              return (
                <div
                  key={item.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === (currentGallerySlide % 3) ? 'opacity-20' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              );
            });
          })()}
          <div className="absolute inset-0 bg-white bg-opacity-85"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Galeri <span className="text-blue-600">Kegiatan</span>
            </h2>
            <div className="w-32 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dokumentasi berbagai kegiatan dan momen berharga di sekolah kami
            </p>
          </div>

          {/* Gallery Carousel */}
          <div className="relative mb-12">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${(currentGallerySlide % 3) * 100}%)` }}
              >
                {(() => {
                  // Create 3 slides from gallery data
                  const gallerySlides = [];
                  const galleryData = carouselGallery.length > 0 ? carouselGallery : [
                    { id: 1, title: 'Kegiatan Sekolah', description: 'Dokumentasi kegiatan sekolah', image_url: null },
                    { id: 2, title: 'Pembelajaran', description: 'Proses pembelajaran siswa', image_url: null },
                    { id: 3, title: 'Ekstrakurikuler', description: 'Kegiatan ekstrakurikuler', image_url: null }
                  ];

                  // Create 3 slides dengan data yang berputar terus ke kanan
                  for (let slideIndex = 0; slideIndex < 3; slideIndex++) {
                    const slideCards = [];
                    for (let cardIndex = 0; cardIndex < 3; cardIndex++) {
                      // Rotasi data berdasarkan currentGallerySlide untuk efek geser terus
                      const itemIndex = (currentGallerySlide + slideIndex + cardIndex) % galleryData.length;
                      const item = galleryData[itemIndex];
                      slideCards.push(item);
                    }
                    gallerySlides.push(slideCards);
                  }

                  return gallerySlides.map((slideCards, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="flex gap-6 px-4 overflow-x-auto scrollbar-hide min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-8 min-[900px]:overflow-x-visible" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                        {slideCards.map((item, cardIndex) => {
                          const imageUrl = item.url || item.image_url || item.path;
                          const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`) : null;

                          return (
                            <div
                              key={`${item.id}-${slideIndex}-${cardIndex}`}
                              className="bg-white shadow-2xl shadow-gray-400/50 overflow-hidden w-80 flex-shrink-0 min-[900px]:w-auto min-[900px]:flex-shrink"
                            >
                              {/* Card Image */}
                              <div className="relative h-64 overflow-hidden p-2">
                                <div
                                  className="bg-cover bg-center h-full w-full"
                                  style={{
                                    backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    backgroundColor: '#f3f4f6'
                                  }}
                                />
                              </div>

                              {/* Card Content */}
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {item.title || `Galeri ${cardIndex + 1}`}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  maxHeight: '2.5rem'
                                }}>
                                  {(() => {
                                    const desc = item.description || 'Dokumentasi kegiatan dan momen berharga di sekolah kami yang menampilkan berbagai aktivitas siswa';
                                    return desc.length > 85 ? desc.substring(0, 85) + '...' : desc;
                                  })()}
                                </p>

                                {/* Card Footer */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Terbaru'}
                                  </div>
                                  <div className="flex items-center text-blue-600 text-sm font-medium">
                                    <span className="mr-1">Lihat</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center mt-12 space-x-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGallerySlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === (currentGallerySlide % 3)
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-8">
            <Link
              to="/gallery"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl shadow-gray-800/70 border-2 border-white"
            >
              Lihat Semua Galeri
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      <section
        className="relative min-h-screen py-20"
        onMouseEnter={() => setIsNewsAutoPlay(false)}
        onMouseLeave={() => setIsNewsAutoPlay(true)}
      >
        <div className="absolute inset-0">
          {news && news.length > 0 ? news.map((item, index) => {
            const imageUrl = item.image_url ? `http://localhost:8000${item.image_url}` : null;

            return (
              <div
                key={item.id || index}
                className={`absolute inset-0 transition-opacity duration-1200 ease-in-out ${
                  index === (currentNewsIndex % news.length) ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#F59E0B'
                }}
              />
            );
          }) : (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="relative z-10 w-full px-0 flex flex-col justify-center min-h-screen">
          <div className="px-4 sm:px-5 lg:px-7">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Berita <span className="text-white">Terbaru</span>
              </h2>
              <div className="w-32 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-xl text-white">
                Informasi terkini dan berita penting seputar kegiatan sekolah
              </p>
            </div>
            {/* News Carousel */}
            <div className="relative mb-12">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-1000 ease-in-out"
                  style={{ transform: `translateX(-${(currentNewsSlide % 3) * 100}%)` }}
                >
                  {(() => {
                    // Create 3 slides from news data
                    const newsSlides = [];
                    const newsData = news.length > 0 ? news : [
                      { id: 1, title: 'Berita Sekolah', content: 'Informasi terbaru seputar kegiatan sekolah', image_url: null },
                      { id: 2, title: 'Prestasi Siswa', content: 'Pencapaian membanggakan siswa-siswi kami', image_url: null },
                      { id: 3, title: 'Kegiatan Ekstrakurikuler', content: 'Berbagai kegiatan pengembangan bakat siswa', image_url: null }
                    ];

                    // Create 3 slides, each showing 3 cards
                    for (let slideIndex = 0; slideIndex < 3; slideIndex++) {
                      const slideCards = [];
                      for (let cardIndex = 0; cardIndex < 3; cardIndex++) {
                        // Rotasi data berdasarkan currentNewsSlide untuk efek geser terus
                        const itemIndex = (currentNewsSlide + slideIndex + cardIndex) % newsData.length;
                        const item = newsData[itemIndex];
                        slideCards.push(item);
                      }
                      newsSlides.push(slideCards);
                    }

                    return newsSlides.map((slideCards, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="flex gap-6 px-4 overflow-x-auto scrollbar-hide min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-8 min-[900px]:overflow-x-visible" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                          {slideCards.map((item, cardIndex) => {
                            const imageUrl = item.image_url ? `http://localhost:8000${item.image_url}` : null;

                            return (
                              <div
                                key={`${item.id}-${slideIndex}-${cardIndex}`}
                                className="bg-white bg-opacity-95 shadow-2xl shadow-gray-600/60 overflow-hidden w-80 flex-shrink-0 min-[900px]:w-auto min-[900px]:flex-shrink"
                              >
                                {/* Card Image */}
                                <div className="relative h-48 overflow-hidden p-4">
                                  <div
                                    className="bg-cover bg-center h-full w-full"
                                    style={{
                                      backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      backgroundColor: '#f3f4f6'
                                    }}
                                  />
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {item.title || `Berita ${cardIndex + 1}`}
                                  </h3>
                                  <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    maxHeight: '2.5rem'
                                  }}>
                                    {(() => {
                                      const desc = item.content || item.description || 'Informasi terkini dan berita penting seputar kegiatan sekolah yang memberikan update terbaru';
                                      return desc.length > 85 ? desc.substring(0, 85) + '...' : desc;
                                    })()}
                                  </p>

                                  {/* Card Footer */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'Terbaru'}
                                    </div>
                                    <div className="flex items-center text-blue-600 text-sm font-medium">
                                      <span className="mr-1">Baca</span>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Carousel Dots */}
              <div className="flex justify-center mt-12 space-x-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentNewsSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === (currentNewsSlide % 3)
                        ? 'bg-white scale-125'
                        : 'bg-white bg-opacity-50 hover:bg-white hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center mt-20">
              <Link
                to="/news"
                className="bg-blue-900 text-white px-6 py-2 text-base font-semibold shadow-lg inline-flex items-center border-2 border-white hover:bg-blue-800 transition-colors duration-200"
              >
                Lihat Semua Berita
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>
      <CTASection />

    </div>
  );
};

export default Home;
