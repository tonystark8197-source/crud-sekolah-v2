import { api } from './api';

// Activity service untuk mencatat aktivitas CRUD
class ActivityService {
  // Log aktivitas ke backend
  static async logActivity(action, type, details = '') {
    try {
      const activityData = {
        action,
        type,
        details,
        timestamp: new Date().toISOString(),
        user_id: localStorage.getItem('adminUserId') || null
      };

      // Kirim ke backend
      await api.post('/admin/activities', activityData);
      
      // Trigger refresh dashboard jika ada
      if (window.refreshDashboard) {
        window.refreshDashboard();
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Simpan ke localStorage sebagai fallback
      this.logToLocalStorage(action, type, details);
    }
  }

  // Fallback ke localStorage jika backend tidak tersedia
  static logToLocalStorage(action, type, details = '') {
    try {
      const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const newActivity = {
        id: Date.now(),
        action,
        type,
        details,
        time: this.getTimeAgo(new Date()),
        timestamp: new Date().toISOString()
      };

      activities.unshift(newActivity);
      // Simpan maksimal 20 aktivitas
      const limitedActivities = activities.slice(0, 20);
      localStorage.setItem('recentActivities', JSON.stringify(limitedActivities));

      // Trigger refresh dashboard
      if (window.refreshDashboard) {
        window.refreshDashboard();
      }
    } catch (error) {
      console.error('Failed to save activity to localStorage:', error);
    }
  }

  // Get activities dari localStorage
  static getLocalActivities() {
    try {
      const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      return activities.slice(0, 5); // Return 5 terbaru
    } catch (error) {
      console.error('Failed to get activities from localStorage:', error);
      return [];
    }
  }

  // Helper untuk format waktu
  static getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik yang lalu`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    }
  }

  // Predefined activity messages
  static getActivityMessage(action, type, details = '') {
    const messages = {
      news: {
        create: `Berita baru "${details}" ditambahkan`,
        update: `Berita "${details}" diperbarui`,
        delete: `Berita "${details}" dihapus`,
        publish: `Berita "${details}" dipublikasikan`,
        unpublish: `Berita "${details}" disembunyikan`
      },
      gallery: {
        create: `Foto baru "${details}" ditambahkan ke galeri`,
        update: `Foto "${details}" diperbarui`,
        delete: `Foto "${details}" dihapus dari galeri`,
        upload: `${details} foto baru diupload ke galeri`
      },
      user: {
        create: `Pengguna baru "${details}" ditambahkan`,
        update: `Data pengguna "${details}" diperbarui`,
        delete: `Pengguna "${details}" dihapus`,
        login: `Pengguna "${details}" login`,
        logout: `Pengguna "${details}" logout`
      },
      contact: {
        create: `Pesan baru dari "${details}" diterima`,
        update: `Pesan dari "${details}" diperbarui`,
        delete: `Pesan dari "${details}" dihapus`,
        read: `Pesan dari "${details}" dibaca`,
        reply: `Balasan dikirim ke "${details}"`
      },
      settings: {
        update: `Pengaturan ${details} diperbarui`,
        backup: `Backup sistem dibuat`,
        restore: `Sistem direstore dari backup`
      }
    };

    return messages[type]?.[action] || `${action} ${type} ${details}`;
  }

  // Method untuk log aktivitas spesifik
  static async logNews(action, title) {
    const message = this.getActivityMessage(action, 'news', title);
    await this.logActivity(message, 'news', title);
  }

  static async logGallery(action, title) {
    const message = this.getActivityMessage(action, 'gallery', title);
    await this.logActivity(message, 'gallery', title);
  }

  static async logUser(action, username) {
    const message = this.getActivityMessage(action, 'user', username);
    await this.logActivity(message, 'user', username);
  }

  static async logContact(action, name) {
    const message = this.getActivityMessage(action, 'contact', name);
    await this.logActivity(message, 'message', name);
  }

  static async logSettings(action, setting) {
    const message = this.getActivityMessage(action, 'settings', setting);
    await this.logActivity(message, 'settings', setting);
  }
}

export default ActivityService;
