import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const GalleryImageSelector = ({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedImageUrl = null 
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch gallery images
  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gallery');
      if (response.data.success) {
        setImages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
      // Set selected image if provided
      if (selectedImageUrl) {
        setSelectedImage(selectedImageUrl);
      }
    }
  }, [isOpen, selectedImageUrl]);

  // Filter images based on search term
  const filteredImages = images.filter(image =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image selection
  const handleImageSelect = (image) => {
    const imageUrl = `http://localhost:8000${image.image_url}`;
    setSelectedImage(imageUrl);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedImage && onSelect) {
      onSelect(selectedImage);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Pilih Gambar dari Gallery
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Pilih gambar yang akan dimasukkan ke dalam konten
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari gambar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat gambar...</span>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada gambar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada gambar yang sesuai dengan pencarian.' : 'Belum ada gambar di gallery.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => {
                  const imageUrl = `http://localhost:8000${image.image_url}`;
                  const isSelected = selectedImage === imageUrl;
                  
                  return (
                    <div
                      key={image.id}
                      onClick={() => handleImageSelect(image)}
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Image */}
                      <div className="aspect-square">
                        <img
                          src={imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {image.title}
                        </h4>
                        {image.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {selectedImage ? (
                <span className="text-green-600 font-medium">✓ Gambar dipilih</span>
              ) : (
                'Pilih gambar untuk melanjutkan'
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedImage}
                className={`
                  px-4 py-2 rounded-lg transition-colors
                  ${selectedImage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Pilih Gambar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryImageSelector;
