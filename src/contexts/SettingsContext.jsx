import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolLogo: '',
    loading: true,
    error: null
  });

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/website/meta');
      if (response.data.success) {
        const { title, favicon: faviconUrl, description } = response.data.data;
        
        setSettings(prev => ({
          ...prev,
          schoolName: title,
          schoolLogo: faviconUrl,
          metaDescription: description,
          loading: false
        }));

        // Update document title and favicon
        document.title = title;
        const faviconElement = document.querySelector('link[rel="icon"]');
        if (faviconElement) {
          faviconElement.href = faviconUrl;
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setSettings(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load settings'
      }));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, refetchSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
