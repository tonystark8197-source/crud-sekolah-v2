import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSchoolSettings } from '../hooks/useSchoolSettings';

const Footer = () => {
  const { settings, loading } = useSchoolSettings();
  const location = useLocation();

  return (
    <>
      {/* Desktop Footer - Hidden on mobile (< 900px) */}
      <footer className="hidden min-[900px]:block bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-3 gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                {!loading && settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt={`Logo ${settings.schoolShortName}`}
                    className="h-10 w-10 mr-4 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <h3 className="text-xl font-semibold">
                  {loading ? 'Loading...' : settings.schoolName}
                </h3>
              </div>
              <p className="text-gray-300 text-base">
                {loading ? 'Loading...' : settings.schoolDescription}
              </p>
              {!loading && settings.schoolMotto && (
                <p className="text-blue-300 text-base mt-3 italic">
                  "{settings.schoolMotto}"
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white text-base transition duration-300">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-white text-base transition duration-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="/news" className="text-gray-300 hover:text-white text-base transition duration-300">
                    News
                  </a>
                </li>
                <li>
                  <a href="/gallery" className="text-gray-300 hover:text-white text-base transition duration-300">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white text-base transition duration-300">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact</h3>
              <div className="text-gray-300 text-base space-y-3">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <p className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email: {settings.schoolEmail}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone: {settings.schoolPhone}
                    </p>
                    <p className="flex items-start">
                      <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address: {settings.schoolAddress}
                    </p>
                    {settings.schoolWebsite && (
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-3">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
</svg>
                        Website:
                        <a
                          href={settings.schoolWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-300 hover:text-blue-200 transition duration-300 text-xs"
                        >
                          {settings.schoolWebsite.replace('https://', '').replace('http://', '')}
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-10 pt-8">
            <div className="text-center">
              <p className="text-gray-300 text-base mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>
                {loading ? 'Loading...' : `© 2025 ${settings.schoolName}. All rights reserved.`}
              </p>
            </div>
          </div>
        </div>

        {/* Full Width Copyright Bar */}
        <div className="bg-black w-full py-4">
          <div className="text-center">
            <p className="text-white text-base" style={{ fontFamily: 'Arial, sans-serif' }}>
              © Copyright by IT SOLUTION JOGJAKARTA
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Footer - Only visible on mobile (< 900px) */}
      <footer className="max-[899px]:block min-[900px]:hidden bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center space-y-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center justify-center mb-4">
                {!loading && settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt={`Logo ${settings.schoolShortName}`}
                    className="h-10 w-10 mr-4 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <h3 className="text-xl font-semibold">
                  {loading ? 'Loading...' : settings.schoolName}
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {loading ? 'Loading...' : settings.schoolDescription}
              </p>
              {!loading && settings.schoolMotto && (
                <p className="text-blue-300 text-sm italic">
                  "{settings.schoolMotto}"
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="text-gray-300 text-sm space-y-2">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {settings.schoolEmail}
                  </p>
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {settings.schoolPhone}
                  </p>
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {settings.schoolAddress}
                  </p>
                </>
              )}
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 pt-4 text-center">
              <p className="text-gray-300 text-xs mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                {loading ? 'Loading...' : `© 2025 ${settings.schoolName}. All rights reserved.`}
              </p>
            </div>
          </div>
        </div>

        {/* Full Width Copyright Bar */}
        <div className="bg-black w-full py-3">
          <div className="text-center">
            <p className="text-white text-xs" style={{ fontFamily: 'Arial, sans-serif' }}>
              Copyright by IT SOLUTION JOGJAKARTA
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation - Only visible on mobile (< 900px) */}
      <nav className="min-[900px]:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          <a
            href="/"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              location.pathname === '/'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            } transition-colors duration-200`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>

          <a
            href="/about"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              location.pathname === '/about'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            } transition-colors duration-200`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>About</span>
          </a>

          <a
            href="/news"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              location.pathname === '/news'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            } transition-colors duration-200`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>News</span>
          </a>

          <a
            href="/gallery"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              location.pathname === '/gallery'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            } transition-colors duration-200`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Gallery</span>
          </a>

          <a
            href="/contact"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              location.pathname === '/contact'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            } transition-colors duration-200`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact</span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default Footer;
