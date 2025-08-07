import { useState, useEffect, useCallback } from 'react';
import { useSchoolSettings } from '../hooks/useSchoolSettings';
import { useCarouselGallery } from '../hooks/useGallery';
import { useNews } from '../hooks/useNews';
import { Link } from 'react-router-dom';
import ImageSlider from '../components/ImageSlider';
import ImageModal from '../components/ImageModal';

// Memory cache untuk gambar
const imageCache = new Map();
const preloadedImages = new Set();

const Home = () => {
  const { settings } = useSchoolSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    images: carouselGallery,
    refreshCarousel,
  } = useCarouselGallery(refreshTrigger);
  const { news } = useNews({ limit: 6, featured: false });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // Handle image click
  const handleImageClick = (image, index) => {
    if (image && typeof index === 'number') {
      setSelectedImage(image);
      setSelectedImageIndex(index);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const renderCarouselContent = () => {
    // Always show carousel immediately - even if empty, show placeholder with default images
    if (carouselGallery.length === 0) {
      // Show default carousel with school building image instead of empty state
      const defaultImages = [
        {
          id: 'default-1',
          title: 'Selamat Datang di Sistem Informasi Sekolah',
          description: 'Platform digital untuk informasi sekolah terkini',
          url: '/images/school-building.jpg',
          image_url: '/images/school-building.jpg'
        }
      ];

      return (
        <ImageSlider
          images={defaultImages}
          onImageClick={handleImageClick}
          autoPlay={true}
          interval={5000}
          height="h-[100vh]"
        />
      );
    }

    return (
      <ImageSlider
        images={carouselGallery}
        autoPlay={true}
        showButtons={true}
        className="rounded-none overflow-hidden"
        onImageClick={handleImageClick}
        height="h-[100vh]"
      />
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section - Full Screen */}
      <section className="relative">
        <div className="w-full">
          {renderCarouselContent()}
        </div>
        
        {/* Overlay Welcome Text */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
              Selamat Datang di
            </h1>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 text-yellow-400 drop-shadow-lg">
              {settings.schoolName || 'SMK N TEMBARAK'}
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-lg max-w-3xl mx-auto">
              {settings.schoolDescription || 'Membangun Generasi Unggul dengan Pendidikan Berkualitas dan Berkarakter'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/about" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Tentang Kami
              </Link>
              <Link 
                to="/contact" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tentang <span className="text-blue-600">Sekolah Kami</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Komitmen kami adalah memberikan pendidikan terbaik untuk masa depan yang cerah
              </p>
            </div>

            {/* Mobile & Tablet: Vertical Layout */}
            <div className="block xl:hidden">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Visi Kami</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {settings.vision || 'Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, kompeten, dan siap menghadapi tantangan global.'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Misi Kami</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {settings.mission || 'Menyelenggarakan pendidikan berkualitas dengan mengintegrasikan teknologi, nilai-nilai karakter, dan keterampilan abad 21.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                    <div className="text-gray-600 font-medium">Siswa Aktif</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
                    <div className="text-gray-600 font-medium">Guru & Staff</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
                    <div className="text-gray-600 font-medium">Program Studi</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="text-4xl font-bold text-orange-600 mb-2">25+</div>
                    <div className="text-gray-600 font-medium">Tahun Berpengalaman</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop (>900px): Fully Horizontal Layout */}
            <div className="hidden xl:flex xl:items-stretch xl:gap-8">
              {/* Visi Card */}
              <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visi Kami</h3>
                <p className="text-gray-600 leading-relaxed">
                  {settings.vision || 'Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, kompeten, dan siap menghadapi tantangan global.'}
                </p>
              </div>

              {/* Misi Card */}
              <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Misi Kami</h3>
                <p className="text-gray-600 leading-relaxed">
                  {settings.mission || 'Menyelenggarakan pendidikan berkualitas dengan mengintegrasikan teknologi, nilai-nilai karakter, dan keterampilan abad 21.'}
                </p>
              </div>

              {/* Stats Cards - All Horizontal */}
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Siswa Aktif</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Guru & Staff</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
                <div className="text-gray-600 font-medium">Program Studi</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl font-bold text-orange-600 mb-2">25+</div>
                <div className="text-gray-600 font-medium">Tahun Berpengalaman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Program <span className="text-blue-600">Unggulan</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Berbagai program pendidikan yang dirancang untuk mengembangkan potensi siswa secara optimal
              </p>
            </div>

            {/* Mobile & Tablet: 3 columns max */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:hidden gap-8">
            {[
              {
                icon: "🎓",
                title: "Akademik Unggulan",
                description: "Program pembelajaran dengan kurikulum terkini dan metode pengajaran inovatif"
              },
              {
                icon: "💻",
                title: "Teknologi Digital",
                description: "Integrasi teknologi dalam pembelajaran untuk mempersiapkan era digital"
              },
              {
                icon: "🏆",
                title: "Ekstrakurikuler",
                description: "Beragam kegiatan untuk mengembangkan bakat dan minat siswa"
              },
              {
                icon: "🌟",
                title: "Pengembangan Karakter",
                description: "Pembentukan karakter dan nilai-nilai moral yang kuat"
              },
              {
                icon: "🔬",
                title: "Laboratorium Modern",
                description: "Fasilitas laboratorium lengkap untuk praktik dan eksperimen"
              },
              {
                icon: "🌍",
                title: "Wawasan Global",
                description: "Program pertukaran dan kerjasama internasional"
              }
            ].map((program, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4">{program.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{program.title}</h3>
                <p className="text-gray-600 leading-relaxed">{program.description}</p>
              </div>
            ))}
            </div>

            {/* Desktop (>900px): Fully Horizontal - 6 columns */}
            <div className="hidden xl:flex xl:gap-6">
            {[
              {
                icon: "🎓",
                title: "Akademik Unggulan",
                description: "Program pembelajaran dengan kurikulum terkini dan metode pengajaran inovatif."
              },
              {
                icon: "💻",
                title: "Teknologi Digital",
                description: "Integrasi teknologi dalam pembelajaran untuk mempersiapkan era digital."
              },
              {
                icon: "🏆",
                title: "Ekstrakurikuler",
                description: "Beragam kegiatan untuk mengembangkan bakat dan minat siswa."
              },
              {
                icon: "🌟",
                title: "Pengembangan Karakter",
                description: "Pembentukan karakter dan nilai-nilai moral yang kuat."
              },
              {
                icon: "🔬",
                title: "Laboratorium Modern",
                description: "Fasilitas laboratorium lengkap untuk praktik dan eksperimen."
              },
              {
                icon: "🌍",
                title: "Wawasan Global",
                description: "Program pertukaran dan kerjasama internasional."
              }
            ].map((program, index) => (
              <div key={index} className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{program.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-teal-100">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Fasilitas <span className="text-green-600">Sekolah</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Fasilitas lengkap dan modern untuk mendukung proses pembelajaran yang optimal
              </p>
            </div>

            {/* Mobile & Tablet: 4 columns max */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:hidden gap-8">
            {[
              {
                icon: "🏫",
                title: "Ruang Kelas Modern",
                description: "Ruang kelas ber-AC dengan proyektor dan fasilitas multimedia"
              },
              {
                icon: "📚",
                title: "Perpustakaan Digital",
                description: "Koleksi buku lengkap dengan akses digital dan ruang baca nyaman"
              },
              {
                icon: "🔬",
                title: "Laboratorium",
                description: "Lab IPA, Komputer, dan Bahasa dengan peralatan modern"
              },
              {
                icon: "⚽",
                title: "Lapangan Olahraga",
                description: "Lapangan basket, voli, dan sepak bola untuk aktivitas olahraga"
              },
              {
                icon: "🍽️",
                title: "Kantin Sehat",
                description: "Kantin dengan menu sehat dan bergizi untuk siswa"
              },
              {
                icon: "🚌",
                title: "Transportasi",
                description: "Layanan antar jemput siswa dengan rute yang aman"
              },
              {
                icon: "🏥",
                title: "UKS",
                description: "Unit Kesehatan Sekolah dengan tenaga medis profesional"
              },
              {
                icon: "🎭",
                title: "Aula Serbaguna",
                description: "Ruang serbaguna untuk acara dan kegiatan sekolah"
              }
            ].map((facility, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl mb-4">{facility.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{facility.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{facility.description}</p>
              </div>
            ))}
            </div>

            {/* Desktop (>900px): Fully Horizontal - 8 columns */}
            <div className="hidden xl:flex xl:gap-4">
            {[
              {
                icon: "🏫",
                title: "Ruang Kelas Modern",
                description: "Ruang kelas ber-AC dengan proyektor dan fasilitas multimedia"
              },
              {
                icon: "📚",
                title: "Perpustakaan Digital",
                description: "Koleksi buku lengkap dengan akses digital dan ruang baca nyaman"
              },
              {
                icon: "🔬",
                title: "Laboratorium",
                description: "Lab IPA, Komputer, dan Bahasa dengan peralatan modern"
              },
              {
                icon: "⚽",
                title: "Lapangan Olahraga",
                description: "Lapangan basket, voli, dan sepak bola untuk aktivitas olahraga"
              },
              {
                icon: "🍽️",
                title: "Kantin Sehat",
                description: "Kantin dengan menu sehat dan bergizi untuk siswa"
              },
              {
                icon: "🚌",
                title: "Transportasi",
                description: "Layanan antar jemput siswa dengan rute yang aman"
              },
              {
                icon: "🏥",
                title: "UKS",
                description: "Unit Kesehatan Sekolah dengan tenaga medis profesional"
              },
              {
                icon: "🎭",
                title: "Aula Serbaguna",
                description: "Ruang serbaguna untuk acara dan kegiatan sekolah"
              }
            ].map((facility, index) => (
              <div key={index} className="flex-1 bg-white rounded-2xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl mb-3">{facility.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{facility.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{facility.description}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Prestasi <span className="text-yellow-600">Terbaru</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Berbagai prestasi membanggakan yang telah diraih siswa dan sekolah
              </p>
            </div>

            {/* Mobile & Tablet: 3 columns max */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:hidden gap-8">
            {[
              {
                medal: "🥇",
                title: "Juara 1 Olimpiade Matematika",
                description: "Tingkat Provinsi 2024",
                student: "Ahmad Rizki - Kelas XI"
              },
              {
                medal: "🥈",
                title: "Juara 2 Lomba Robotika",
                description: "Tingkat Nasional 2024",
                student: "Tim Robotika SMK"
              },
              {
                medal: "🥉",
                title: "Juara 3 Debat Bahasa Inggris",
                description: "Tingkat Regional 2024",
                student: "Sari Dewi - Kelas XII"
              },
              {
                medal: "🏆",
                title: "Sekolah Adiwiyata",
                description: "Tingkat Nasional 2023",
                student: "Penghargaan Sekolah"
              },
              {
                medal: "⭐",
                title: "Akreditasi A",
                description: "BAN-SM 2023",
                student: "Sertifikat Sekolah"
              },
              {
                medal: "🎖️",
                title: "Best Innovation Award",
                description: "Science Fair 2024",
                student: "Tim Penelitian"
              }
            ].map((achievement, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4">{achievement.medal}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-orange-600 font-semibold mb-2">{achievement.description}</p>
                <p className="text-gray-600 text-sm">{achievement.student}</p>
              </div>
            ))}
            </div>

            {/* Desktop (>900px): Fully Horizontal - 6 columns */}
            <div className="hidden xl:flex xl:gap-6">
            {[
              {
                medal: "🥇",
                title: "Juara 1 Olimpiade Matematika",
                description: "Tingkat Provinsi 2024",
                student: "Ahmad Rizki - Kelas XI"
              },
              {
                medal: "🥈",
                title: "Juara 2 Lomba Robotika",
                description: "Tingkat Nasional 2024",
                student: "Tim Robotika SMK"
              },
              {
                medal: "🥉",
                title: "Juara 3 Debat Bahasa Inggris",
                description: "Tingkat Regional 2024",
                student: "Sari Dewi - Kelas XII"
              },
              {
                medal: "🏆",
                title: "Sekolah Adiwiyata",
                description: "Tingkat Nasional 2023",
                student: "Penghargaan Sekolah"
              },
              {
                medal: "⭐",
                title: "Akreditasi A",
                description: "BAN-SM 2023",
                student: "Sertifikat Sekolah"
              },
              {
                medal: "🎖️",
                title: "Best Innovation Award",
                description: "Science Fair 2024",
                student: "Tim Penelitian"
              }
            ].map((achievement, index) => (
              <div key={index} className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl mb-3">{achievement.medal}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-orange-600 font-semibold mb-2 text-sm">{achievement.description}</p>
                <p className="text-gray-600 text-xs">{achievement.student}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Berita & <span className="text-indigo-600">Pengumuman</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Informasi terkini seputar kegiatan dan pengumuman penting sekolah
              </p>
            </div>

            {/* Mobile & Tablet: 3 columns max */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:hidden gap-8 mb-12">
            {news.slice(0, 6).map((newsItem) => {
              let imageUrl = newsItem.image_url;
              if (imageUrl && imageUrl.startsWith('http://localhost:8000/images/news/')) {
                const filename = imageUrl.split('/').pop();
                imageUrl = `/images/news/${filename}`;
              }

              return (
                <div key={newsItem.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-indigo-200 to-blue-200 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-indigo-600" style={{display: imageUrl ? 'none' : 'flex'}}>
                      <div className="text-center">
                        <div className="text-4xl mb-2">📰</div>
                        <div className="text-sm font-medium">Berita</div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {new Date(newsItem.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {newsItem.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {newsItem.excerpt || newsItem.content?.substring(0, 120) + '...'}
                    </p>
                    <Link
                      to={`/news/${newsItem.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm inline-flex items-center"
                    >
                      Baca Selengkapnya
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Desktop (>900px): 6 columns horizontal */}
            <div className="hidden xl:grid xl:grid-cols-6 gap-6 mb-12">
            {news.slice(0, 6).map((newsItem) => {
              let imageUrl = newsItem.image_url;
              if (imageUrl && imageUrl.startsWith('http://localhost:8000/images/news/')) {
                const filename = imageUrl.split('/').pop();
                imageUrl = `/images/news/${filename}`;
              }

              return (
                <div key={newsItem.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-indigo-200 to-blue-200 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-indigo-600" style={{display: imageUrl ? 'none' : 'flex'}}>
                      <div className="text-center">
                        <div className="text-3xl mb-1">📰</div>
                        <div className="text-xs font-medium">Berita</div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {new Date(newsItem.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                      {newsItem.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {newsItem.excerpt || newsItem.content?.substring(0, 80) + '...'}
                    </p>
                    <Link
                      to={`/news/${newsItem.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs inline-flex items-center"
                    >
                      Baca Selengkapnya
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>

            <div className="text-center">
              <Link
                to="/news"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Lihat Semua Berita
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Galeri <span className="text-purple-600">Kegiatan</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dokumentasi berbagai kegiatan dan momen berharga di sekolah
              </p>
            </div>

            {/* Mobile & Tablet: 4 columns max */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:hidden gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="w-full h-full flex items-center justify-center text-purple-600">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <div className="text-sm font-medium">Kegiatan {item}</div>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Desktop (>900px): 8 columns horizontal */}
            <div className="hidden xl:grid xl:grid-cols-8 gap-3 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="w-full h-full flex items-center justify-center text-purple-600">
                  <div className="text-center">
                    <div className="text-3xl mb-1">📸</div>
                    <div className="text-xs font-medium">Kegiatan {item}</div>
                  </div>
                </div>
              </div>
            ))}
            </div>

            <div className="text-center">
              <Link
                to="/gallery"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Lihat Semua Galeri
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="w-full px-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Hubungi <span className="text-blue-400">Kami</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Kami siap membantu dan menjawab pertanyaan Anda
              </p>
            </div>

            {/* Mobile & Tablet: 4 columns max */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:hidden gap-8">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Alamat</h3>
                <p className="text-gray-300">
                  {settings.address || 'Jl. Pendidikan No. 123, Tembarak, Temanggung'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Telepon</h3>
                <p className="text-gray-300">
                  {settings.phone || '(0293) 123-4567'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Email</h3>
                <p className="text-gray-300">
                  {settings.email || 'info@smkntembarak.sch.id'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Jam Operasional</h3>
                <p className="text-gray-300">
                  Senin - Jumat<br />
                  07:00 - 16:00 WIB
                </p>
              </div>
            </div>

            {/* Desktop (>900px): 4 columns horizontal */}
            <div className="hidden xl:flex xl:justify-center xl:gap-8">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Alamat</h3>
                <p className="text-gray-300">
                  {settings.address || 'Jl. Pendidikan No. 123, Tembarak, Temanggung'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Telepon</h3>
                <p className="text-gray-300">
                  {settings.phone || '(0293) 123-4567'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Email</h3>
                <p className="text-gray-300">
                  {settings.email || 'info@smkntembarak.sch.id'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Jam Operasional</h3>
                <p className="text-gray-300">
                  Senin - Jumat<br />
                  07:00 - 16:00 WIB
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Kirim Pesan
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={carouselGallery}
          currentIndex={selectedImageIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Home;
