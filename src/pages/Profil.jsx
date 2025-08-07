import { useState, useEffect } from 'react';
import { useCarouselGallery } from '../hooks/useGallery';

const Profil = () => {
  const { images: galleryImages } = useCarouselGallery();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    // Ambil gambar dari gallery berdasarkan ID tertentu
    if (galleryImages && galleryImages.length > 0) {
      // Cari gambar dengan ID tertentu, atau ambil gambar kedua jika ada
      const targetImage = galleryImages.find(img => img.id === 2) || galleryImages[1] || galleryImages[0];
      const imageUrl = targetImage.url || targetImage.image_url || targetImage.path;
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
        setProfileImage(fullImageUrl);
      }
    }
  }, [galleryImages]);

  return (
    <div className="bg-transparent">
      {/* Section Gabungan - Header + Tentang Sekolah */}
      <section className="relative py-20 px-4" style={{
        backgroundImage: profileImage ? `url(${profileImage})` : 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Overlay hitam dengan opacity */}
        <div className="absolute inset-0 bg-black opacity-70"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Judul */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <span className="text-white font-semibold uppercase tracking-wider text-sm mb-2 block">PROFIL KAMI</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                SMK NEGERI <span className="text-white">TEMBARAK</span>
              </h2>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
                Pembangunan SMK Negeri Tembarak dimulai pada tanggal 22 Januari 2007. Peletakan batu pertama dilakukan oleh Kepala Dinas Pendidikan Kabupaten Temanggung.
              </p>
            </div>
          </div>

          {/* Section Tentang Sekolah - Dalam background yang sama */}
          <div className="py-16 px-2">
            <div className="max-w-4xl mx-auto">

              {/* Konten Teks - Full Width */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">SMK Negeri Tembarak</h2>
                  <p className="text-blue-600 font-semibold text-lg mb-3">Sekolah Menengah Kejuruan Unggulan</p>
                  <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                </div>

                <div className="space-y-4 text-gray-700 mb-6">
                  <p className="leading-relaxed text-justify">
                    <strong>SMK Negeri Tembarak</strong> merupakan institusi pendidikan kejuruan terdepan yang berdiri sejak tahun 2007,
                    berlokasi strategis di Kabupaten Temanggung, Jawa Tengah. Sebagai lembaga pendidikan yang berkomitmen pada
                    keunggulan akademik dan profesional, kami mengintegrasikan kurikulum nasional dengan kebutuhan industri modern.
                  </p>

                  <p className="leading-relaxed text-justify">
                    Dengan fasilitas pembelajaran yang lengkap dan tenaga pengajar berpengalaman, SMK Negeri Tembarak telah
                    menghasilkan lebih dari <strong>1.000 lulusan kompeten</strong> yang tersebar di berbagai sektor industri.
                    Sekolah ini menawarkan <strong>3 program keahlian unggulan</strong> yang disesuaikan dengan perkembangan
                    teknologi dan kebutuhan pasar kerja era digital.
                  </p>
                </div>
              </div>

              {/* Button Baca Selengkapnya - Di luar div Tentang */}
              <div className="mt-8 text-center">
                <a href="/about" className="inline-block bg-yellow-600 text-white px-8 py-3 border-2 border-white shadow-lg shadow-black/50 font-semibold hover:bg-yellow-700 transition-colors duration-300">
                  Baca Selengkapnya
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profil;
