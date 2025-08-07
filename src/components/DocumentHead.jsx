import { useEffect } from 'react';
import { useSchoolSettings } from '../hooks/useSchoolSettings';

export function DocumentHead() {
  const { settings, loading } = useSchoolSettings();

  useEffect(() => {
    if (loading || !settings) return;

    // Update document title
    if (settings.websiteTitle) {
      document.title = settings.websiteTitle;
    } else if (settings.schoolName) {
      document.title = settings.schoolName;
    }

    // Update favicon
    if (settings.faviconUrl) {
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Create new favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = settings.faviconUrl;
      document.head.appendChild(favicon);

      // Also update apple-touch-icon for mobile
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleTouchIcon) {
        appleTouchIcon.href = settings.faviconUrl;
      } else {
        const newAppleTouchIcon = document.createElement('link');
        newAppleTouchIcon.rel = 'apple-touch-icon';
        newAppleTouchIcon.href = settings.faviconUrl;
        document.head.appendChild(newAppleTouchIcon);
      }
    } else if (settings.logoUrl) {
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Create new favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = settings.logoUrl;
      document.head.appendChild(favicon);

      // Also update apple-touch-icon for mobile
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleTouchIcon) {
        appleTouchIcon.href = settings.logoUrl;
      } else {
        const newAppleTouchIcon = document.createElement('link');
        newAppleTouchIcon.rel = 'apple-touch-icon';
        newAppleTouchIcon.href = settings.logoUrl;
        document.head.appendChild(newAppleTouchIcon);
      }
    }

    // Update meta description
    if (settings.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = settings.description;
    }

    // Update meta keywords
    if (settings.schoolName) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = `${settings.schoolName}, sekolah, pendidikan, ${settings.address || ''}`;
    }
  }, [settings, loading]);

  return null; // This is a utility component that doesn't render anything
}
