/**
 * Storage capacity and cache management utilities
 */

// Storage capacity utilities
export const getStorageInfo = () => {
  try {
    // Test localStorage availability
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Calculate used storage
    let usedBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedBytes += localStorage[key].length + key.length;
      }
    }
    
    // Estimate total capacity by trying to store data
    let totalCapacity = 0;
    try {
      const testData = 'x'.repeat(1024); // 1KB chunks
      let testKey = '__capacity_test__';
      let chunks = 0;
      
      // Try to fill storage to estimate capacity (limit test to avoid hanging)
      while (chunks < 5120) { // Max 5MB test to be safe
        try {
          localStorage.setItem(testKey + chunks, testData);
          chunks++;
        } catch {
          break;
        }
      }
      
      // Clean up test data
      for (let i = 0; i < chunks; i++) {
        localStorage.removeItem(testKey + i);
      }
      
      totalCapacity = (chunks * 1024) + usedBytes;
      
      // If we couldn't determine capacity, use common browser limits
      if (totalCapacity < usedBytes) {
        totalCapacity = 10 * 1024 * 1024; // Default 10MB estimate
      }
    } catch {
      totalCapacity = 10 * 1024 * 1024; // Default 10MB estimate
    }
    
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
    const totalMB = (totalCapacity / (1024 * 1024)).toFixed(2);
    const usagePercent = totalCapacity > 0 ? ((usedBytes / totalCapacity) * 100).toFixed(1) : 0;
    
    return {
      available: true,
      usedBytes,
      totalCapacity,
      usedMB: parseFloat(usedMB),
      totalMB: parseFloat(totalMB),
      usagePercent: parseFloat(usagePercent),
      freeBytes: totalCapacity - usedBytes,
      freeMB: parseFloat(((totalCapacity - usedBytes) / (1024 * 1024)).toFixed(2))
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      usedBytes: 0,
      totalCapacity: 0,
      usedMB: 0,
      totalMB: 0,
      usagePercent: 0,
      freeBytes: 0,
      freeMB: 0
    };
  }
};

// Get cache-specific storage info
export const getCacheStorageInfo = () => {
  try {
    const storageInfo = getStorageInfo();
    
    // Calculate cache-specific usage
    let cacheBytes = 0;
    let cacheItems = 0;
    
    // News cache
    const newsCache = localStorage.getItem('newsDetailCache');
    if (newsCache) {
      cacheBytes += newsCache.length + 'newsDetailCache'.length;
      cacheItems++;
    }
    
    // Logo cache
    for (let key in localStorage) {
      if (key.startsWith('logo_')) {
        cacheBytes += localStorage[key].length + key.length;
        cacheItems++;
      }
    }
    
    const cacheMB = (cacheBytes / (1024 * 1024)).toFixed(2);
    const cachePercent = storageInfo.totalCapacity > 0 ? 
      ((cacheBytes / storageInfo.totalCapacity) * 100).toFixed(1) : 0;
    
    return {
      ...storageInfo,
      cache: {
        bytes: cacheBytes,
        mb: parseFloat(cacheMB),
        items: cacheItems,
        percentOfTotal: parseFloat(cachePercent)
      }
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      cache: { bytes: 0, mb: 0, items: 0, percentOfTotal: 0 }
    };
  }
};

// Clear all cache data
export const clearAllCache = () => {
  try {
    // Clear news cache
    localStorage.removeItem('newsDetailCache');
    
    // Clear logo cache
    for (let key in localStorage) {
      if (key.startsWith('logo_')) {
        localStorage.removeItem(key);
      }
    }
    
    console.info('All cache data cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get storage status with color coding
export const getStorageStatus = (usagePercent) => {
  if (usagePercent < 50) {
    return { status: 'good', color: 'green', message: 'Storage usage is healthy' };
  } else if (usagePercent < 80) {
    return { status: 'warning', color: 'yellow', message: 'Storage usage is moderate' };
  } else if (usagePercent < 95) {
    return { status: 'high', color: 'orange', message: 'Storage usage is high' };
  } else {
    return { status: 'critical', color: 'red', message: 'Storage is nearly full' };
  }
};

// Monitor storage and provide recommendations
export const getStorageRecommendations = (storageInfo) => {
  const recommendations = [];
  
  if (!storageInfo.available) {
    recommendations.push({
      type: 'error',
      message: 'localStorage is not available in this browser'
    });
    return recommendations;
  }
  
  if (storageInfo.usagePercent > 90) {
    recommendations.push({
      type: 'critical',
      message: 'Storage is nearly full. Consider clearing cache or browser data.'
    });
  } else if (storageInfo.usagePercent > 75) {
    recommendations.push({
      type: 'warning',
      message: 'Storage usage is high. Monitor usage or clear unnecessary data.'
    });
  }
  
  if (storageInfo.cache && storageInfo.cache.percentOfTotal > 25) {
    recommendations.push({
      type: 'info',
      message: `Cache is using ${storageInfo.cache.percentOfTotal}% of total storage. Consider clearing cache if needed.`
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'Storage usage is healthy.'
    });
  }
  
  return recommendations;
};
