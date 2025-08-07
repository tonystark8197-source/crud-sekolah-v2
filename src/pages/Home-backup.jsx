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
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
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
  const [isGalleryAutoPlay, setIsGalleryAutoPlay] = useState(true);
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

  // Auto carousel untuk main carousel
  useEffect(() => {
    if (!isAutoPlay || carouselGallery.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev =>
        prev === carouselGallery.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselGallery.length, isAutoPlay, currentSlide]);

  // Auto carousel untuk gallery section
  useEffect(() => {
    if (!isGalleryAutoPlay || carouselGallery.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGalleryIndex(prev =>
        prev === carouselGallery.length - 1 ? 0 : prev + 1
      );
    }, 4000); // 4 detik untuk gallery

    return () => clearInterval(interval);
  }, [carouselGallery.length, isGalleryAutoPlay]);

  // Auto carousel untuk news section
  useEffect(() => {
    if (!isNewsAutoPlay || !news || news.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex(prev =>
        prev === news.length - 1 ? 0 : prev + 1
      );
    }, 6000); // 6 detik untuk news

    return () => clearInterval(interval);
  }, [news, isNewsAutoPlay]);

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
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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
                        <svg className="w-24 h-24 mx-auto mb-4 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                        </svg>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4">{slide.title || slide.name || 'SMK NEGERI TEMBARAK'}</h2>
                      <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
                        {slide.description || slide.caption || 'Membangun Generasi Unggul dan Berkarakter'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        {slide.title || slide.name || 'SMK NEGERI TEMBARAK'}
                      </h2>
                      <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto drop-shadow-md">
                        {slide.description || slide.caption || 'Membangun Generasi Unggul dan Berkarakter'}
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 text-white p-3 rounded-full"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 text-white p-3 rounded-full"
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {carouselData.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide
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
      <section
        className="relative min-h-screen py-20"
        onMouseEnter={() => setIsGalleryAutoPlay(false)}
        onMouseLeave={() => setIsGalleryAutoPlay(true)}
      >
        <div className="absolute inset-0">
          {carouselGallery.map((item, index) => {
            const imageUrl = item.url || item.image_url || item.path;
            const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`) : null;

            return (
              <div
                key={item.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentGalleryIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#B8860B'
                }}
              />
            );
          })}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="relative z-10 w-full px-0 flex flex-col justify-center min-h-screen">
          <div className="px-4 sm:px-5 lg:px-7">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Galeri <span className="text-white">Kegiatan</span>
              </h2>
              <div className="w-32 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-xl text-white">
                Dokumentasi berbagai kegiatan dan momen berharga di sekolah kami
              </p>
            </div>
            <div className="relative w-full mb-8">
              <button
                onClick={() => setCurrentGalleryIndex(prev => prev > 0 ? prev - 1 : carouselGallery.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 transition-all duration-300"
                onMouseEnter={() => setIsGalleryAutoPlay(false)}
                onMouseLeave={() => setIsGalleryAutoPlay(true)}
              >
                <svg className="w-8 h-8 text-white hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentGalleryIndex(prev => prev < carouselGallery.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 transition-all duration-300"
                onMouseEnter={() => setIsGalleryAutoPlay(false)}
                onMouseLeave={() => setIsGalleryAutoPlay(true)}
              >
                <svg className="w-8 h-8 text-white hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>

            </div>
            <div className="text-center mt-16">
              <Link
                to="/gallery"
                className="bg-blue-900 text-white px-6 py-2 text-base font-semibold shadow-lg inline-flex items-center border-2 border-white hover:bg-blue-800 transition-colors duration-200"
              >
                Lihat Semua Galeri
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {carouselGallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGalleryIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentGalleryIndex
                      ? 'bg-white scale-125'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  onMouseEnter={() => setIsGalleryAutoPlay(false)}
                  onMouseLeave={() => setIsGalleryAutoPlay(true)}
                />
              ))}
            </div>
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
                  index === currentNewsIndex ? 'opacity-100' : 'opacity-0'
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
            <div className="relative w-full mb-8">
              <button
                onClick={() => setCurrentNewsIndex(prev => prev > 0 ? prev - 1 : (news?.length || 1) - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 transition-all duration-300"
                onMouseEnter={() => setIsNewsAutoPlay(false)}
                onMouseLeave={() => setIsNewsAutoPlay(true)}
              >
                <svg className="w-8 h-8 text-white hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentNewsIndex(prev => prev < (news?.length || 1) - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 transition-all duration-300"
                onMouseEnter={() => setIsNewsAutoPlay(false)}
                onMouseLeave={() => setIsNewsAutoPlay(true)}
              >
                <svg className="w-8 h-8 text-white hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>

            </div>
            <div className="text-center mt-16">
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
            {news && news.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {news.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentNewsIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentNewsIndex
                        ? 'bg-white scale-125'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    onMouseEnter={() => setIsNewsAutoPlay(false)}
                    onMouseLeave={() => setIsNewsAutoPlay(true)}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-6 space-x-2 hidden">
              {news && news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentNewsIndex
                      ? 'bg-white scale-125'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />

    </div>
  );
};

export default Home;
