import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  // Use static image from public folder
  const backgroundImage = "url('/images/cta/cta-background.jpg')";

  return (
    <section
      className="relative bg-cover bg-center py-12"
      style={{
        backgroundImage: backgroundImage,
      }}
    >
      {/* Overlay Gelap dengan opacity 70% */}
      <div className="absolute inset-0 bg-black opacity-70"></div>

      {/* Konten */}
      <div className="relative max-w-5xl mx-auto flex items-center justify-center px-4 text-white">

        {/* Teks + Tombol - Centered */}
        <div className="w-full text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            <span className="block text-blue-300">Mari Bergabung</span>
            <span className="block text-blue-300">Bersama</span>
            <span className="block text-yellow-400">SMK N TEMBARAK</span>
          </h2>

          {/* Tombol dengan stroke */}
          <Link
            to="/contact"
            className="inline-block mt-8 px-10 py-5 bg-green-600 text-white text-xl font-bold rounded-lg border-4 border-white shadow-lg hover:bg-green-700 hover:scale-105 transition-all duration-300"
          >
            DAFTAR SEKARANG
          </Link>

          {/* Info kontak */}
          <div className="mt-8 space-y-3 text-sm text-white">
            <div className="flex items-center justify-center">
              📞 <span className="ml-2">(0295) 123-4567</span>
            </div>
            <div className="flex items-center justify-center">
              ✉️ <span className="ml-2">info@smkntembarak.sch.id</span>
            </div>
            <div className="flex items-center justify-center">
              📍 <span className="ml-2">Jl. Pendidikan No. 123, Tembarak</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
