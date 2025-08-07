import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950" style={{ backgroundColor: '#1e40af' }}>
        <div className="absolute inset-0 bg-blue-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent"></div>
        <div className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto text-center text-white">
            <div className="inline-flex items-center px-3 sm:px-5 min-[900px]:px-6 py-2 sm:py-3 min-[900px]:py-4 bg-white/15 backdrop-blur-md rounded-full text-xs sm:text-sm min-[900px]:text-base font-semibold mb-4 sm:mb-6 min-[900px]:mb-8 border border-white/20 min-[900px]:border-white/30">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 min-[900px]:w-6 min-[900px]:h-6 mr-2 sm:mr-3 min-[900px]:mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="hidden sm:inline min-[900px]:hidden">Terakreditasi A - Sekolah Unggulan</span>
              <span className="sm:hidden">Terakreditasi A</span>
              <span className="hidden min-[900px]:inline font-bold tracking-wide">🏆 TERAKREDITASI A - SEKOLAH UNGGULAN NASIONAL</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-7 md:mb-8 leading-tight">
              SMK NEGERI <span className="text-amber-400 block sm:inline">TEMBARAK</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-xl lg:text-2xl mb-8 sm:mb-9 opacity-95 leading-relaxed max-w-5xl mx-auto font-light px-2 sm:px-0">
              Membangun Generasi Unggul dengan Pendidikan Berkualitas Tinggi dan Berkarakter Kuat untuk Masa Depan yang Gemilang
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mt-8 sm:mt-9">
              <div className="bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/25 transition-all duration-300 border border-white/20">
                <div className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-2 sm:mb-2 md:mb-3">500+</div>
                <div className="text-sm sm:text-sm md:text-base opacity-95 font-medium">Siswa Aktif</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/25 transition-all duration-300 border border-white/20">
                <div className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-2 sm:mb-2 md:mb-3">50+</div>
                <div className="text-sm sm:text-sm md:text-base opacity-95 font-medium">Guru & Staff</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/25 transition-all duration-300 border border-white/20">
                <div className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-2 sm:mb-2 md:mb-3">3</div>
                <div className="text-sm sm:text-sm md:text-base opacity-95 font-medium">Jurusan Unggulan</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:bg-white/25 transition-all duration-300 border border-white/20">
                <div className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-amber-400 mb-2 sm:mb-2 md:mb-3">2007</div>
                <div className="text-sm sm:text-sm md:text-base opacity-95 font-medium">Tahun Berdiri</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-20 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative w-full px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">

            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Tentang <span className="text-yellow-400">Sekolah Kami</span>
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto mb-8"></div>
              <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed font-semibold opacity-90">
                SMK Negeri Tembarak adalah lembaga pendidikan kejuruan terdepan yang telah membuktikan keunggulannya dalam mencetak generasi muda Indonesia yang kompeten, berkarakter mulia, dan siap bersaing di era global dengan teknologi terdepan
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-16 items-start">

              {/* Left Content - Vision & Mission */}
              <div className="space-y-8 min-[900px]:space-y-8 space-y-6">

                {/* Vision Card */}
                <div className="bg-white rounded-2xl p-6 min-[900px]:p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 group">
                  {/* Mobile Layout (< 900px) */}
                  <div className="block min-[900px]:hidden">
                    <div className="text-center mb-4">
                      <div className="bg-blue-600 rounded-xl p-3 inline-block mb-3 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-blue-600 mb-2 tracking-wide">VISI</h3>
                      <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-4"></div>
                    </div>
                    <p className="text-gray-800 leading-relaxed text-sm font-medium text-center">
                      "Menjadi <span className="font-bold text-blue-700">sekolah menengah kejuruan terdepan</span> di Indonesia yang menghasilkan lulusan <span className="font-bold text-blue-700">berkarakter unggul</span>, <span className="font-bold text-blue-700">kompeten secara profesional</span>, dan mampu berinovasi dalam menghadapi tantangan <span className="font-bold text-blue-700">revolusi industri 4.0</span> dengan tetap berpegang teguh pada nilai-nilai Pancasila dan kearifan lokal."
                    </p>
                  </div>

                  {/* Desktop Layout (>= 900px) */}
                  <div className="hidden min-[900px]:block">
                    <div className="flex items-start mb-6">
                      <div className="bg-blue-600 rounded-xl p-3 mr-5 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-blue-600 mb-2 tracking-wide">VISI</h3>
                        <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="pl-14">
                      <p className="text-gray-800 leading-relaxed text-base font-medium">
                        "Menjadi <span className="font-bold text-blue-700">sekolah menengah kejuruan terdepan</span> di Indonesia yang menghasilkan lulusan <span className="font-bold text-blue-700">berkarakter unggul</span>, <span className="font-bold text-blue-700">kompeten secara profesional</span>, dan mampu berinovasi dalam menghadapi tantangan <span className="font-bold text-blue-700">revolusi industri 4.0</span> dengan tetap berpegang teguh pada nilai-nilai Pancasila dan kearifan lokal."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mission Card */}
                <div className="bg-white rounded-2xl p-6 min-[900px]:p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 group">
                  {/* Mobile Layout (< 900px) */}
                  <div className="block min-[900px]:hidden">
                    <div className="text-center mb-4">
                      <div className="bg-green-600 rounded-xl p-3 inline-block mb-3 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-green-600 mb-2 tracking-wide">MISI</h3>
                      <div className="w-16 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-2 inline-block mb-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-sm font-medium">
                          <span className="font-bold text-green-700">Excellence in Education:</span> Menyelenggarakan pendidikan kejuruan berkualitas world-class dengan kurikulum yang adaptif terhadap perkembangan teknologi dan kebutuhan industri masa depan.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-2 inline-block mb-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-sm font-medium">
                          <span className="font-bold text-green-700">Character Building:</span> Membentuk karakter siswa yang berintegritas tinggi, berjiwa kepemimpinan, dan memiliki semangat entrepreneurship untuk menciptakan lapangan kerja.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-2 inline-block mb-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-sm font-medium">
                          <span className="font-bold text-green-700">Strategic Partnership:</span> Membangun ekosistem pembelajaran yang kolaboratif dengan industri, universitas, dan lembaga penelitian untuk menghasilkan inovasi berkelanjutan.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="bg-green-100 rounded-full p-2 inline-block mb-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-sm font-medium">
                          <span className="font-bold text-green-700">Digital Innovation:</span> Mengembangkan fasilitas pembelajaran berbasis teknologi digital dan smart campus untuk mendukung proses belajar mengajar yang efektif dan efisien.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout (>= 900px) */}
                  <div className="hidden min-[900px]:block">
                    <div className="flex items-start mb-6">
                      <div className="bg-green-600 rounded-xl p-3 mr-5 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-green-600 mb-2 tracking-wide">MISI</h3>
                        <div className="w-16 h-1 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="pl-14">
                    <div className="space-y-5">
                      <div className="flex items-start group/item">
                        <div className="bg-green-100 rounded-full p-2 mr-4 mt-1 group-hover/item:bg-green-200 transition-colors duration-300">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-base font-medium flex-1">
                          <span className="font-bold text-green-700">Excellence in Education:</span> Menyelenggarakan pendidikan kejuruan berkualitas world-class dengan kurikulum yang adaptif terhadap perkembangan teknologi dan kebutuhan industri masa depan.
                        </p>
                      </div>

                      <div className="flex items-start group/item">
                        <div className="bg-green-100 rounded-full p-2 mr-4 mt-1 group-hover/item:bg-green-200 transition-colors duration-300">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-base font-medium flex-1">
                          <span className="font-bold text-green-700">Character Building:</span> Membentuk karakter siswa yang berintegritas tinggi, berjiwa kepemimpinan, dan memiliki semangat entrepreneurship untuk menciptakan lapangan kerja.
                        </p>
                      </div>

                      <div className="flex items-start group/item">
                        <div className="bg-green-100 rounded-full p-2 mr-4 mt-1 group-hover/item:bg-green-200 transition-colors duration-300">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-base font-medium flex-1">
                          <span className="font-bold text-green-700">Strategic Partnership:</span> Membangun ekosistem pembelajaran yang kolaboratif dengan industri, universitas, dan lembaga penelitian untuk menghasilkan inovasi berkelanjutan.
                        </p>
                      </div>

                      <div className="flex items-start group/item">
                        <div className="bg-green-100 rounded-full p-2 mr-4 mt-1 group-hover/item:bg-green-200 transition-colors duration-300">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-800 leading-relaxed text-base font-medium flex-1">
                          <span className="font-bold text-green-700">Digital Innovation:</span> Mengembangkan fasilitas pembelajaran berbasis teknologi digital dan smart campus untuk mendukung proses belajar mengajar yang efektif dan efisien.
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - School Image & Info */}
              <div className="space-y-10">
                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="SMK Negeri Tembarak"
                      className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-white">
                      <h4 className="text-2xl font-bold mb-3">SMK Negeri Tembarak</h4>
                      <p className="text-base opacity-95">Kampus Modern & Fasilitas Terdepan</p>
                    </div>
                    <div className="absolute top-6 right-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      Terakreditasi A
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-30"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-600 rounded-full opacity-20"></div>
                </div>

                {/* School History Card - Responsive */}
                <div className="bg-white rounded-2xl min-[900px]:rounded-3xl p-6 min-[900px]:p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
                  <h4 className="text-xl min-[900px]:text-2xl font-bold text-gray-900 mb-4 min-[900px]:mb-6">Sejarah & Prestasi Gemilang</h4>

                  {/* Mobile Layout (< 900px) */}
                  <div className="block min-[900px]:hidden space-y-4">
                    <p className="text-gray-800 leading-relaxed text-base font-medium">
                      SMK Negeri Tembarak didirikan pada tahun 2007 sebagai jawaban atas kebutuhan tenaga kerja terampil di era industrialisasi. Berawal dari visi besar untuk mencerdaskan anak bangsa, sekolah ini telah bertransformasi menjadi institusi pendidikan kejuruan terdepan di Jawa Tengah.
                    </p>
                    <p className="text-gray-800 leading-relaxed text-base font-medium">
                      Dengan komitmen terhadap excellence in education, kami telah meluluskan lebih dari 5.000 alumni yang kini berkarir di berbagai perusahaan multinasional, BUMN, dan sebagai entrepreneur sukses yang menciptakan lapangan kerja bagi masyarakat.
                    </p>
                  </div>

                  {/* Desktop Layout (>= 900px) */}
                  <div className="hidden min-[900px]:block">
                    <p className="text-gray-800 leading-relaxed mb-6 text-lg font-semibold">
                      SMK Negeri Tembarak didirikan pada tahun 2007 sebagai jawaban atas kebutuhan tenaga kerja terampil di era industrialisasi. Berawal dari visi besar untuk mencerdaskan anak bangsa, sekolah ini telah bertransformasi menjadi institusi pendidikan kejuruan terdepan di Jawa Tengah.
                    </p>
                    <p className="text-gray-800 leading-relaxed mb-8 text-lg font-semibold">
                      Dengan komitmen terhadap excellence in education, kami telah meluluskan lebih dari 5.000 alumni yang kini berkarir di berbagai perusahaan multinasional, BUMN, dan sebagai entrepreneur sukses yang menciptakan lapangan kerja bagi masyarakat.
                    </p>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section - Full Screen */}
      <section className="min-h-screen py-12 pb-32 bg-yellow-400">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col justify-start min-h-screen pt-8">

            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Program <span className="text-blue-600">Keahlian Unggulan</span>
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-semibold">
                Tiga program keahlian pilihan yang dirancang khusus untuk mempersiapkan generasi muda menghadapi tantangan industri 4.0 dengan kompetensi tinggi dan daya saing global
              </p>
            </div>

            {/* Programs Grid - Mobile Vertical Layout */}
            <div className="space-y-6 min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-8 min-[900px]:space-y-0">

              {/* Program 1 - Teknik Mekatronika */}
              <div className="bg-white shadow-2xl shadow-black/40 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300">
                <div className="p-4">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src="/images/card/teknik-mekatronika.jpg"
                      alt="Teknik Mekatronika"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center" style={{display: 'none'}}>
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                        </svg>
                        <span className="text-sm font-medium">Teknik Mekatronika</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                    </svg>
                    Teknik Mekatronika
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-medium">
                    Menguasai teknologi <span className="font-bold text-blue-600">otomasi industri</span> dengan integrasi sistem mekanik, elektronik, dan kontrol cerdas untuk masa depan industri 4.0
                  </p>
                </div>
              </div>

              {/* Program 2 - Teknik Elektronika Industri */}
              <div className="bg-white shadow-2xl shadow-black/40 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300">
                <div className="p-4">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src="/images/card/teknik-elektronika-industri.jpg"
                      alt="Teknik Elektronika Industri"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center" style={{display: 'none'}}>
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"/>
                        </svg>
                        <span className="text-sm font-medium">Teknik Elektronika Industri</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 3v6h8V3m0 8v6h-8v-6M3 21h8v-6H3m0-2h8V3H3v10z"/>
                    </svg>
                    Teknik Elektronika Industri
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-medium">
                    Spesialisasi <span className="font-bold text-green-600">sistem kontrol elektronik</span> dan instrumentasi industri dengan teknologi SCADA dan IoT terdepan
                  </p>
                </div>
              </div>

              {/* Program 3 - Rekayasa Perangkat Lunak */}
              <div className="bg-white shadow-2xl shadow-black/40 hover:shadow-3xl hover:shadow-black/60 transition-all duration-300">
                <div className="p-4">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src="/images/card/rekayasa-perangkat-lunak.jpg"
                      alt="Rekayasa Perangkat Lunak"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center" style={{display: 'none'}}>
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"/>
                        </svg>
                        <span className="text-sm font-medium">Rekayasa Perangkat Lunak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors duration-300 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3m8 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
                    </svg>
                    Rekayasa Perangkat Lunak
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-medium">
                    Menjadi <span className="font-bold text-purple-600">software developer profesional</span> dengan keahlian full-stack, mobile app, dan teknologi AI/ML terkini
                  </p>
                </div>
              </div>

            </div>

            {/* Call to Action Button */}
            <div className="text-center mt-12">
              <Link
                to="/contact"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 text-lg font-bold border-4 border-white shadow-2xl shadow-black/80"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Ayo Gabung Bersama Kami!
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
