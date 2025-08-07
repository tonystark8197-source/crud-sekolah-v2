import { useState, useEffect } from 'react';
import { useSchoolSettings } from '../hooks/useSchoolSettings';
import { getCurrentLogo, getLatestLogo, fixLogoUrl, DEFAULT_LOGO_PATH, clearLogoCache } from '../utils/logoUtils';

const LogoDebug = () => {
  const { settings, loading } = useSchoolSettings();
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const collectDebugInfo = async () => {
    try {
      const info = {
        timestamp: new Date().toLocaleTimeString(),
        settings: {
          logoUrl: settings.logoUrl,
          schoolShortName: settings.schoolShortName,
          loading
        },
        cache: {
          sessionStorage: sessionStorage.getItem('cachedLogoUrl'),
          localStorage: localStorage.getItem('schoolSettings')
        },
        api: {},
        urls: {
          default: DEFAULT_LOGO_PATH,
          fixed: fixLogoUrl(settings.logoUrl)
        }
      };

      // Test API endpoints
      try {
        const currentResponse = await fetch('http://localhost:8000/api/logo/current');
        const currentResult = await currentResponse.json();
        info.api.current = currentResult;
      } catch (error) {
        info.api.current = { error: error.message };
      }

      // Test logo utils
      try {
        const currentLogo = await getCurrentLogo();
        info.api.currentLogo = currentLogo;
      } catch (error) {
        info.api.currentLogo = { error: error.message };
      }

      try {
        const latestLogo = await getLatestLogo();
        info.api.latestLogo = latestLogo;
      } catch (error) {
        info.api.latestLogo = { error: error.message };
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo({ error: error.message });
    }
  };

  useEffect(() => {
    if (isVisible) {
      collectDebugInfo();
      const interval = setInterval(collectDebugInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible, settings]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-600"
          title="Show Logo Debug Info"
        >
          🐛
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-bold text-sm">🐛 Logo Debug</h3>
        <div className="flex gap-2">
          <button
            onClick={collectDebugInfo}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={() => {
              clearLogoCache();
              collectDebugInfo();
            }}
            className="text-orange-600 hover:text-orange-800 text-sm"
            title="Clear Cache"
          >
            🧹
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-4 text-xs">
        <div className="mb-3">
          <strong>Current Logo Preview:</strong>
          <div className="mt-1 p-2 bg-gray-50 rounded">
            <img
              src={settings.logoUrl || DEFAULT_LOGO_PATH}
              alt="Current Logo"
              className="w-12 h-12 object-contain border"
              onLoad={() => console.log('Debug logo loaded:', settings.logoUrl)}
              onError={() => console.log('Debug logo error:', settings.logoUrl)}
            />
            <div className="text-xs mt-1 break-all">
              {settings.logoUrl || 'No URL'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <details>
            <summary className="cursor-pointer font-semibold">Settings</summary>
            <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(debugInfo.settings, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">Cache</summary>
            <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(debugInfo.cache, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">API</summary>
            <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(debugInfo.api, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">URLs</summary>
            <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
              {JSON.stringify(debugInfo.urls, null, 2)}
            </pre>
          </details>
        </div>

        <div className="mt-3 pt-2 border-t text-xs text-gray-500">
          Last updated: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  );
};

export default LogoDebug;
