import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/NavbarNew';
import Footer from '../components/Footer';

const HomeSimple = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section dengan CTA - Menggunakan struktur yang Anda berikan */}
      <section 
        className="relative bg-cover bg-center py-20" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
        }}
      >
        {/* Overlay */}
        <div className="bg-black/60 absolute inset-0"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 px-4">

          {/* Video Column */}
          <div className="w-full md:w-1/2 aspect-video">
            {/* YouTube Embed Placeholder dengan styling yang menarik */}
            <div className="relative w-full h-full rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Video Profil SMK N TEMBARAK"
                className="w-full h-full object-cover"
              />

              {/* YouTube Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-all duration-300 transform hover:scale-110 shadow-xl">
                  <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>

              {/* YouTube UI Elements */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">S</span>
                    </div>
                    <span className="font-medium">SMK N TEMBARAK</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teks dan Tombol Column */}
          <div className="w-full md:w-1/2 text-center md:text-left text-white">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug">
              <span className="block text-blue-300">Mari Bergabung</span>
              <span className="block text-blue-300">Bersama</span>
              <span className="block text-yellow-400">SMK N TEMBARAK</span>
            </h2>
            
            <Link 
              to="/contact"
              className="inline-block mt-6 px-6 py-3 bg-green-600 text-white font-bold rounded-lg 
                         border-2 border-white shadow-lg hover:bg-green-700 hover:scale-105 
                         transition-all duration-300"
            >
              DAFTAR SEKARANG
            </Link>

            {/* Contact Info */}
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(0295) 123-4567</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>info@smkntembarak.sch.id</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Jl. Pendidikan No. 123, Tembarak</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sections lainnya bisa ditambahkan di sini */}
      
      <Footer />
    </div>
  );
};

export default HomeSimple;
