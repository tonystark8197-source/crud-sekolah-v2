import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState({});
  const [cssVariables, setCssVariables] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThemeSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/theme-settings');
      
      if (response.data.success) {
        setThemeSettings(response.data.data);
        setCssVariables(response.data.css_variables || '');
        
        // Apply CSS variables to document root
        if (response.data.css_variables) {
          applyThemeVariables(response.data.data);
        }
      } else {
        throw new Error('Failed to fetch theme settings');
      }
    } catch (err) {
      console.error('Error fetching theme settings:', err);
      setError(err.message || 'Failed to load theme settings');
      setThemeSettings({});
    } finally {
      setLoading(false);
    }
  };

  // Apply theme variables to CSS custom properties
  const applyThemeVariables = (settings) => {
    const root = document.documentElement;
    
    Object.values(settings).forEach(componentSettings => {
      if (Array.isArray(componentSettings)) {
        componentSettings.forEach(setting => {
          if (setting.is_active) {
            const varName = `--color-${setting.component_name}-${setting.element_name}-${setting.color_type}`;
            root.style.setProperty(varName, setting.color_value);
          }
        });
      }
    });
  };

  useEffect(() => {
    fetchThemeSettings();
  }, []);

  // Helper functions to get specific colors
  const getColor = (component, element, colorType, defaultColor = '#3B82F6') => {
    const componentSettings = themeSettings[component];
    if (!componentSettings || !Array.isArray(componentSettings)) {
      return defaultColor;
    }
    
    const setting = componentSettings.find(s => 
      s.element_name === element && 
      s.color_type === colorType && 
      s.is_active
    );
    
    return setting ? setting.color_value : defaultColor;
  };

  const getComponentColors = (component) => {
    return themeSettings[component] || [];
  };

  // Generate CSS variable name
  const getCssVariable = (component, element, colorType) => {
    return `var(--color-${component}-${element}-${colorType})`;
  };

  // Generate inline style object
  const getThemeStyle = (component, element, colorType, property = 'backgroundColor', defaultColor = '#3B82F6') => {
    const color = getColor(component, element, colorType, defaultColor);
    return { [property]: color };
  };

  // Get theme class name for Tailwind CSS
  const getThemeClass = (component, element, colorType, prefix = 'bg') => {
    // This would require custom Tailwind configuration
    // For now, return empty string and use inline styles
    return '';
  };

  return {
    themeSettings,
    cssVariables,
    loading,
    error,
    refetch: fetchThemeSettings,
    // Helper functions
    getColor,
    getComponentColors,
    getCssVariable,
    getThemeStyle,
    getThemeClass,
    applyThemeVariables
  };
};
