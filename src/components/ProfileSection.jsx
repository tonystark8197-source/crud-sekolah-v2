import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfileSection = ({ settings = {} }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Sekolah Terakreditasi A
            </div>

            {/* Main Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Profil <span className="text-blue-600">Kami</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              {settings.schoolDescription ||
                'SMK N TEMBARAK adalah sekolah menengah atas negeri yang berkomitmen untuk memberikan pendidikan berkualitas tinggi dengan mengembangkan potensi akademik dan karakter siswa.'
              }
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Column - Stats & Features */}
            <div className="lg:col-span-1">
              {/* Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Statistik Sekolah</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-blue-200">
                    <span className="text-gray-600 font-medium">Siswa Aktif</span>
                    <span className="text-2xl font-bold text-blue-600">500+</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-blue-200">
                    <span className="text-gray-600 font-medium">Guru & Staff</span>
                    <span className="text-2xl font-bold text-blue-600">50+</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-blue-200">
                    <span className="text-gray-600 font-medium">Program Keahlian</span>
                    <span className="text-2xl font-bold text-blue-600">15+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Tahun Berdiri</span>
                    <span className="text-2xl font-bold text-blue-600">1985</span>
                  </div>
                </div>
              </div>

              {/* Key Features - 3 Column Cards */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Keunggulan Kami</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      icon: 'fas fa-medal',
                      title: 'Akreditasi A',
                      description: 'Terakreditasi A dari BAN-SM',
                      color: 'from-yellow-400 to-orange-500',
                      bgColor: 'from-yellow-50 to-orange-50',
                      borderColor: 'border-yellow-200'
                    },
                    {
                      icon: 'fas fa-building',
                      title: 'Fasilitas Lengkap',
                      description: 'Lab modern & ruang kelas AC',
                      color: 'from-blue-400 to-blue-600',
                      bgColor: 'from-blue-50 to-blue-100',
                      borderColor: 'border-blue-200'
                    },
                    {
                      icon: 'fas fa-chalkboard-teacher',
                      title: 'Guru Berkualitas',
                      description: 'Tenaga pengajar berpengalaman',
                      color: 'from-green-400 to-green-600',
                      bgColor: 'from-green-50 to-green-100',
                      borderColor: 'border-green-200'
                    },
                    {
                      icon: 'fas fa-laptop',
                      title: 'Teknologi Modern',
                      description: 'Pembelajaran digital terkini',
                      color: 'from-purple-400 to-purple-600',
                      bgColor: 'from-purple-50 to-purple-100',
                      borderColor: 'border-purple-200'
                    }
                  ].map((feature, index) => (
                    <div key={index} className={`group relative bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <i className={`${feature.icon} text-black text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Column - 3 Image Cards */}
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Card 1 - Main School Image */}
                <div className="lg:col-span-3 mb-4">
                  <div className="relative aspect-[16/10] bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
                    {settings.schoolImage && !imageError ? (
                      <img
                        src={settings.schoolImage}
                        alt={`Gedung ${settings.schoolName}`}
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      /* Fallback Main Image */
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <div className="text-center">
                          <svg className="w-20 h-20 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-blue-600 font-semibold text-lg">
                            {settings.schoolShortName || 'SMK N TEMBARAK'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Floating Achievement Badges */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs font-medium text-gray-700">Terakreditasi A</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs font-medium text-gray-700">Berprestasi</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Classroom */}
                <div className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-emerald-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-emerald-600 font-semibold text-sm">Ruang Kelas</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Card 3 - Laboratory */}
                <div className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <p className="text-purple-600 font-semibold text-sm">Laboratorium</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Card 4 - Sports */}
                <div className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-orange-600 font-semibold text-sm">Olahraga</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

              </div>
            </div>

            {/* Right Column - Description & CTA */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Visi & Misi</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Dengan fasilitas lengkap dan tenaga pengajar yang berpengalaman, kami menciptakan lingkungan belajar yang kondusif untuk mengembangkan potensi setiap siswa secara optimal.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Visi kami adalah menjadi lembaga pendidikan terdepan yang menghasilkan generasi cerdas, berkarakter, dan siap menghadapi tantangan masa depan.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <Link
                    to="/about"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
                  >
                    Selengkapnya
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  
                  <Link
                    to="/contact"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* 3 Column Image Cards Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Fasilitas Unggulan</h3>
              <p className="text-lg text-gray-600">Fasilitas modern yang mendukung proses pembelajaran</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 - Laboratorium */}
              <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="text-blue-600 font-semibold">Laboratorium</p>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Laboratorium Modern</h4>
                  <p className="text-gray-600 text-sm">Laboratorium komputer, kimia, dan fisika dengan peralatan terkini untuk mendukung pembelajaran praktis.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Card 2 - Perpustakaan */}
              <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-emerald-600 font-semibold">Perpustakaan</p>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Perpustakaan Digital</h4>
                  <p className="text-gray-600 text-sm">Koleksi buku lengkap dengan sistem digital dan ruang baca yang nyaman untuk mendukung literasi siswa.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Card 3 - Olahraga */}
              <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-orange-600 font-semibold">Olahraga</p>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Fasilitas Olahraga</h4>
                  <p className="text-gray-600 text-sm">Lapangan olahraga lengkap dan gymnasium untuk mengembangkan bakat olahraga dan kesehatan siswa.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
