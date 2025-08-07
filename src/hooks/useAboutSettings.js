import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Cache untuk about settings
const getCachedAboutSettings = () => {
  try {
    const cached = localStorage.getItem('aboutSettings');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Silent error handling
  }
  return {};
};

export const useAboutSettings = () => {
  const [aboutSettings, setAboutSettings] = useState(getCachedAboutSettings());
  const [error, setError] = useState(null);

  const fetchAboutSettings = async () => {
    try {
      setError(null);

      const response = await api.get('/about-settings');

      if (response.data.success) {
        const newSettings = response.data.data;

        // Only update if data actually changed
        const currentSettingsStr = JSON.stringify(aboutSettings);
        const newSettingsStr = JSON.stringify(newSettings);

        if (currentSettingsStr !== newSettingsStr) {
          setAboutSettings(newSettings);

          // Cache in localStorage
          localStorage.setItem('aboutSettings', JSON.stringify(newSettings));
        }
      } else {
        throw new Error('Failed to fetch about settings');
      }
    } catch (err) {
      setError(err.message || 'Failed to load about settings');
      // Keep cached settings, don't overwrite them
    }
    // Remove finally block - no loading state to set
  };

  useEffect(() => {
    fetchAboutSettings();
  }, []);

  // Helper functions to get specific sections
  const getSection = (sectionKey) => {
    return aboutSettings[sectionKey] || null;
  };

  const getSectionData = (sectionKey, defaultValue = null) => {
    const section = getSection(sectionKey);
    return section ? section : defaultValue;
  };

  const getSectionContent = (sectionKey, defaultContent = '') => {
    const section = getSection(sectionKey);
    return section?.content || defaultContent;
  };

  const getSectionTitle = (sectionKey, defaultTitle = '') => {
    const section = getSection(sectionKey);
    return section?.title || defaultTitle;
  };

  const getSectionImage = (sectionKey, defaultImage = null) => {
    const section = getSection(sectionKey);
    return section?.image_url ? `http://localhost:8000${section.image_url}` : defaultImage;
  };

  const getSectionAdditionalData = (sectionKey, defaultData = {}) => {
    const section = getSection(sectionKey);
    return section?.additional_data || defaultData;
  };

  return {
    aboutSettings,
    error,
    refetch: fetchAboutSettings,
    // Helper functions
    getSection,
    getSectionData,
    getSectionContent,
    getSectionTitle,
    getSectionImage,
    getSectionAdditionalData
  };
};
