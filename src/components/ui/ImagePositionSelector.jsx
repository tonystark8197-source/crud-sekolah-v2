import React from 'react';

const ImagePositionSelector = ({ 
  value = 'left', 
  onChange, 
  className = '' 
}) => {
  const positions = [
    {
      value: 'left',
      label: 'Kiri',
      icon: (
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <div className="w-3 h-0.5 bg-gray-400"></div>
          </div>
        </div>
      ),
      description: 'Gambar di sebelah kiri, teks di kanan'
    },
    {
      value: 'right',
      label: 'Kanan',
      icon: (
        <div className="flex items-center space-x-1">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <div className="w-3 h-0.5 bg-gray-400"></div>
          </div>
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
        </div>
      ),
      description: 'Gambar di sebelah kanan, teks di kiri'
    },
    {
      value: 'top',
      label: 'Atas',
      icon: (
        <div className="space-y-1">
          <div className="w-6 h-2 bg-blue-500 rounded"></div>
          <div className="space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-400"></div>
            <div className="w-5 h-0.5 bg-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-400"></div>
          </div>
        </div>
      ),
      description: 'Gambar di atas, teks di bawah'
    },
    {
      value: 'bottom',
      label: 'Bawah',
      icon: (
        <div className="space-y-1">
          <div className="space-y-0.5">
            <div className="w-6 h-0.5 bg-gray-400"></div>
            <div className="w-5 h-0.5 bg-gray-400"></div>
            <div className="w-4 h-0.5 bg-gray-400"></div>
          </div>
          <div className="w-6 h-2 bg-blue-500 rounded"></div>
        </div>
      ),
      description: 'Gambar di bawah, teks di atas'
    },
    {
      value: 'center',
      label: 'Tengah',
      icon: (
        <div className="space-y-1">
          <div className="w-6 h-0.5 bg-gray-400"></div>
          <div className="w-6 h-2 bg-blue-500 rounded"></div>
          <div className="w-6 h-0.5 bg-gray-400"></div>
        </div>
      ),
      description: 'Gambar di tengah, teks di atas dan bawah'
    },
    {
      value: 'background',
      label: 'Background',
      icon: (
        <div className="relative">
          <div className="w-6 h-4 bg-blue-500 rounded opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-0.5">
              <div className="w-4 h-0.5 bg-gray-700"></div>
              <div className="w-3 h-0.5 bg-gray-700"></div>
            </div>
          </div>
        </div>
      ),
      description: 'Gambar sebagai background, teks di atas'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-gray-800">
        Posisi Gambar
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {positions.map((position) => (
          <button
            key={position.value}
            type="button"
            onClick={() => onChange(position.value)}
            className={`
              relative p-3 border-2 rounded-lg transition-all duration-200
              ${value === position.value 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {/* Selection Indicator */}
            {value === position.value && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* Icon */}
            <div className="flex justify-center mb-2">
              {position.icon}
            </div>
            
            {/* Label */}
            <div className="text-sm font-medium text-gray-900 mb-1">
              {position.label}
            </div>
            
            {/* Description */}
            <div className="text-xs text-gray-500 leading-tight">
              {position.description}
            </div>
          </button>
        ))}
      </div>
      
      {/* Current Selection Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-sm font-medium text-blue-900">
              Posisi Terpilih: {positions.find(p => p.value === value)?.label}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {positions.find(p => p.value === value)?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePositionSelector;
