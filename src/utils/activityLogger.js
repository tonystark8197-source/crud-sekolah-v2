import ActivityService from '../services/activityService';

// Utility functions untuk log aktivitas di berbagai halaman admin

// News Activities
export const logNewsActivity = {
  create: (title) => ActivityService.logNews('create', title),
  update: (title) => ActivityService.logNews('update', title),
  delete: (title) => ActivityService.logNews('delete', title),
  publish: (title) => ActivityService.logNews('publish', title),
  unpublish: (title) => ActivityService.logNews('unpublish', title)
};

// Gallery Activities  
export const logGalleryActivity = {
  create: (title) => ActivityService.logGallery('create', title),
  update: (title) => ActivityService.logGallery('update', title),
  delete: (title) => ActivityService.logGallery('delete', title),
  upload: (count) => ActivityService.logGallery('upload', `${count}`)
};

// User Activities
export const logUserActivity = {
  create: (username) => ActivityService.logUser('create', username),
  update: (username) => ActivityService.logUser('update', username),
  delete: (username) => ActivityService.logUser('delete', username),
  login: (username) => ActivityService.logUser('login', username),
  logout: (username) => ActivityService.logUser('logout', username)
};

// Contact Activities
export const logContactActivity = {
  create: (name) => ActivityService.logContact('create', name),
  update: (name) => ActivityService.logContact('update', name),
  delete: (name) => ActivityService.logContact('delete', name),
  read: (name) => ActivityService.logContact('read', name),
  reply: (name) => ActivityService.logContact('reply', name)
};

// Settings Activities
export const logSettingsActivity = {
  update: (setting) => ActivityService.logSettings('update', setting),
  backup: () => ActivityService.logSettings('backup', ''),
  restore: () => ActivityService.logSettings('restore', '')
};

// Generic activity logger
export const logActivity = (action, type, details = '') => {
  ActivityService.logActivity(action, type, details);
};

// Example usage:
/*
// Di NewsManagement.jsx setelah berhasil create berita:
import { logNewsActivity } from '../utils/activityLogger';

const handleCreateNews = async (newsData) => {
  try {
    const response = await api.post('/admin/news', newsData);
    if (response.success) {
      await logNewsActivity.create(newsData.title);
      // ... rest of success handling
    }
  } catch (error) {
    // ... error handling
  }
};

// Di GalleryManagement.jsx setelah upload foto:
import { logGalleryActivity } from '../utils/activityLogger';

const handleUploadPhotos = async (files) => {
  try {
    const response = await api.post('/admin/gallery/upload', files);
    if (response.success) {
      await logGalleryActivity.upload(files.length);
      // ... rest of success handling
    }
  } catch (error) {
    // ... error handling
  }
};

// Di UserManagement.jsx setelah create user:
import { logUserActivity } from '../utils/activityLogger';

const handleCreateUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    if (response.success) {
      await logUserActivity.create(userData.username);
      // ... rest of success handling
    }
  } catch (error) {
    // ... error handling
  }
};

// Di ContactManagement.jsx setelah read pesan:
import { logContactActivity } from '../utils/activityLogger';

const handleReadMessage = async (messageId, senderName) => {
  try {
    const response = await api.put(`/admin/contacts/${messageId}/read`);
    if (response.success) {
      await logContactActivity.read(senderName);
      // ... rest of success handling
    }
  } catch (error) {
    // ... error handling
  }
};
*/
