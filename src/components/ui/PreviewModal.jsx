import React from 'react';

const PreviewPage = ({
  isOpen,
  onClose,
  title,
  content,
  description,
  imageUrl,
  imagePosition = 'left',
  sectionKey
}) => {
  if (!isOpen) return null;

  // Render content based on image position
  const renderContent = () => {
    const imageElement = imageUrl && (
      <div className={`
        ${imagePosition === 'top' || imagePosition === 'bottom' ? 'w-full' : 'w-full lg:w-1/2'}
        ${imagePosition === 'center' ? 'w-full max-w-md mx-auto' : ''}
      `}>
        <img
          src={imageUrl}
          alt={title}
          className={`
            w-full h-auto rounded-lg shadow-lg
            ${imagePosition === 'background' ? 'absolute inset-0 object-cover opacity-20' : ''}
          `}
        />
      </div>
    );

    const textElement = (
      <div className={`
        ${imagePosition === 'top' || imagePosition === 'bottom' || imagePosition === 'center' ? 'w-full' : 'w-full lg:w-1/2'}
        ${imagePosition === 'background' ? 'relative z-10' : ''}
      `}>
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {title}
          </h2>
        )}
        
        {description && (
          <p className="text-lg text-gray-600 mb-6">
            {description}
          </p>
        )}
        
        {content && (
          <div 
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    );

    // Layout based on position
    switch (imagePosition) {
      case 'left':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {imageElement}
            {textElement}
          </div>
        );
      
      case 'right':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {textElement}
            {imageElement}
          </div>
        );
      
      case 'top':
        return (
          <div className="space-y-8">
            {imageElement}
            {textElement}
          </div>
        );
      
      case 'bottom':
        return (
          <div className="space-y-8">
            {textElement}
            {imageElement}
          </div>
        );
      
      case 'center':
        return (
          <div className="text-center space-y-8">
            {textElement}
            {imageElement}
          </div>
        );
      
      case 'background':
        return (
          <div className="relative min-h-[400px] rounded-lg overflow-hidden">
            {imageElement}
            <div className="relative z-10 p-8 flex items-center justify-center min-h-[400px]">
              {textElement}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-8">
            {textElement}
            {imageElement}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kembali ke Form"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Preview: {sectionKey}
                </h1>
                <p className="text-sm text-gray-500">
                  Pratinjau bagaimana konten akan tampil di halaman About
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Mode Preview</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preview Container */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {renderContent()}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Informasi Preview
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Preview ini menunjukkan bagaimana konten akan tampil di halaman About</li>
                <li>• Posisi gambar: <strong>{imagePosition}</strong></li>
                <li>• Layout responsif akan menyesuaikan di perangkat mobile</li>
                <li>• Klik tombol kembali untuk melanjutkan editing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
