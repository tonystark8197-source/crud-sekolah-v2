import React, { createContext, useContext, useEffect } from 'react';
import { useThemeSettings } from '../hooks/useThemeSettings';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const themeData = useThemeSettings();

  // Apply theme when settings change
  useEffect(() => {
    if (!themeData.loading && themeData.themeSettings) {
      // Create and inject CSS variables
      const styleId = 'dynamic-theme-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      // Generate CSS from theme settings
      let css = ':root {\n';
      
      Object.values(themeData.themeSettings).forEach(componentSettings => {
        if (Array.isArray(componentSettings)) {
          componentSettings.forEach(setting => {
            if (setting.is_active) {
              const varName = `--color-${setting.component_name}-${setting.element_name}-${setting.color_type}`;
              css += `  ${varName}: ${setting.color_value};\n`;
            }
          });
        }
      });
      
      css += '}\n\n';

      // Add utility classes for common theme usage
      css += `
/* Theme Utility Classes */
.theme-home-hero-primary { background-color: var(--color-home-hero-primary, #3B82F6); }
.theme-home-hero-text { color: var(--color-home-hero-text, #FFFFFF); }
.theme-home-button-primary { background-color: var(--color-home-button-primary, #1D4ED8); }
.theme-home-card-accent { background-color: var(--color-home-card-accent, #EBF4FF); }

.theme-about-header-primary { color: var(--color-about-header-primary, #3B82F6); }
.theme-about-vision-mission-background { background-color: var(--color-about-vision-mission-background, #2563EB); }

.theme-news-card-hover { border-color: var(--color-news-card-hover, #3B82F6); }

.theme-sidebar-background-primary { background-color: var(--color-sidebar-background-primary, #2563EB); }
.theme-sidebar-text-primary { color: var(--color-sidebar-text-primary, #FFFFFF); }
.theme-sidebar-hover-background { background-color: var(--color-sidebar-hover-background, #1D4ED8); }

.theme-global-primary-main { color: var(--color-global-primary-main, #3B82F6); }
.theme-global-secondary-main { color: var(--color-global-secondary-main, #6B7280); }

/* Hover effects */
.theme-home-button-primary:hover { 
  background-color: var(--color-home-button-primary, #1D4ED8); 
  filter: brightness(0.9);
}

.theme-news-card:hover { 
  border-color: var(--color-news-card-hover, #3B82F6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.theme-sidebar-item:hover { 
  background-color: var(--color-sidebar-hover-background, #1D4ED8);
}
`;

      styleElement.textContent = css;
    }
  }, [themeData.loading, themeData.themeSettings]);

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};
