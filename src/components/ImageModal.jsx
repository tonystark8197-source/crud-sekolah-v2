import React, { useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, image, images, currentIndex, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Button */}
      {images && images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {images && images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image Container */}
      <div className="max-w-4xl max-h-full mx-4 flex flex-col">
        <div className="relative">
          <img
            src={image.url || image.image_url || image.path || '/images/school-building.jpg'}
            alt={image.title}
            className="max-w-full max-h-[80vh] object-contain mx-auto"
            onError={(e) => {
              console.log('Modal image load error for:', image.title, 'URL:', e.target.src);
              e.target.onerror = null;
              e.target.src = '/images/school-building.jpg';
            }}
          />
        </div>

        {/* Image Info */}
        <div className="bg-black bg-opacity-70 backdrop-blur-sm text-white p-4 mt-2 rounded-lg border border-gray-600">
          <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
          {image.description && (
            <p className="text-gray-300 mb-2">{image.description}</p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{image.category}</span>
            {images && images.length > 1 && (
              <span>{currentIndex + 1} / {images.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Background Click to Close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default ImageModal;
