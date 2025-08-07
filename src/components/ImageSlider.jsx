import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images, onImageClick, height = "h-[600px]" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, isAutoPlay, currentIndex]);

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      className={`relative w-full ${height} rounded-xl overflow-hidden shadow-2xl`}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              index === currentIndex
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            <img
              src={image.url || image.image_url || image.path || '/images/school-building.jpg'}
              alt={image.title}
              className="w-full h-full object-cover cursor-pointer"
              loading="eager"
              fetchPriority="high"
              onClick={() => onImageClick && onImageClick(image, index)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/school-building.jpg';
              }}
            />
            {/* Content Overlay - Teks di kiri bawah dengan shadow tanpa background */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <div className="max-w-2xl">
                {/* Upload Date */}
                {image.created_at && (
                  <div className="flex items-center text-white text-sm md:text-base mb-3" style={{textShadow: '3px 3px 8px rgba(0,0,0,1), 1px 1px 3px rgba(0,0,0,0.8)'}}>
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Diunggah pada {formatDate(image.created_at)}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight" style={{textShadow: '4px 4px 10px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,0.9), 1px 1px 3px rgba(0,0,0,0.7)'}}>
                  {image.title}
                </h3>

                {/* Description */}
                {image.description && (
                  <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed" style={{textShadow: '3px 3px 8px rgba(0,0,0,1), 1px 1px 4px rgba(0,0,0,0.8)'}}>
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              } disabled:cursor-not-allowed`}
            />
          ))}
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        {isAutoPlay ? (
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ImageSlider;
