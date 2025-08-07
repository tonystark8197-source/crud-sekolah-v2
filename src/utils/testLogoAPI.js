/**
 * Test utility untuk menguji API logo
 */

import { api } from '../services/api';

export const testLogoAPI = async () => {
  console.log('🧪 Testing Logo API...');
  
  const results = {
    getCurrentLogo: false,
    getLatestLogo: false,
    getAllLogos: false,
    uploadLogo: false
  };

  // Test 1: Get Current Logo
  try {
    console.log('1. Testing GET /api/logos/current...');
    const response = await api.get('/logos/current');
    console.log('✅ Current Logo Response:', response.data);
    results.getCurrentLogo = true;
  } catch (error) {
    console.log('❌ Current Logo Error:', error.response?.data || error.message);
    results.getCurrentLogo = false;
  }

  // Test 2: Get Latest Logo
  try {
    console.log('2. Testing GET /api/logos/latest...');
    const response = await api.get('/logos/latest');
    console.log('✅ Latest Logo Response:', response.data);
    results.getLatestLogo = true;
  } catch (error) {
    console.log('❌ Latest Logo Error:', error.response?.data || error.message);
    results.getLatestLogo = false;
  }

  // Test 3: Get All Logos
  try {
    console.log('3. Testing GET /api/logos/all...');
    const response = await api.get('/logos/all');
    console.log('✅ All Logos Response:', response.data);
    results.getAllLogos = true;
  } catch (error) {
    console.log('❌ All Logos Error:', error.response?.data || error.message);
    results.getAllLogos = false;
  }

  // Test 4: Upload Logo (akan ditest saat ada file)
  console.log('4. Upload test akan dilakukan saat ada file yang dipilih');

  console.log('🧪 Test Results:', results);
  return results;
};

export const testLogoUpload = async (file) => {
  console.log('🧪 Testing Logo Upload...');
  
  try {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('description', 'Test upload from frontend');

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const response = await api.post('/logos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload Success:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ Upload Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};
