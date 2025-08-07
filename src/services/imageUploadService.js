// Image upload service
const validateImage = (file) => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format file harus JPG, PNG, atau WebP');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('Ukuran file maksimal 5MB');
  }

  return true;
};

const uploadImage = async (file, category = 'news') => {
  try {
    // Validate image before upload
    validateImage(file);

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    // Send to backend with proper headers
    const response = await fetch('http://localhost:8000/api/news/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      success: true,
      imageUrl: data.url,
      path: data.path,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload gambar'
    };
  }
};

export const imageService = {
  uploadImage
};
