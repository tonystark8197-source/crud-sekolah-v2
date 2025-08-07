import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { Card, Button } from '../../components/ui';
import { api } from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Swal from 'sweetalert2';

// Memory cache untuk user data
const userMemoryCache = new Map();

// Cache untuk user data
const getCachedUserData = () => {
  try {
    // Check memory cache first
    if (userMemoryCache.has('userData')) {
      return userMemoryCache.get('userData');
    }

    // Then check localStorage
    const cached = localStorage.getItem('userData');
    if (cached) {
      const parsedData = JSON.parse(cached);
      userMemoryCache.set('userData', parsedData);
      return parsedData;
    }
  } catch {
    // Silent error handling
  }

  // Return empty array instead of null to always show table
  return [];
};

const PenggunaManagement = () => {
  const { isAuthenticated, isLoading: authLoading, redirectToLogin } = useAdminAuth();

  // Initialize with cached data - always show table immediately
  const cachedUsers = getCachedUserData();
  const [users, setUsers] = useState(cachedUsers);

  // Form switching states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    employee_id: '',
    password: '',
    password_confirmation: '',
    bio: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Selection states for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAllItems, setSelectAllItems] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
    { value: 'guru', label: 'Guru' },
    { value: 'staff', label: 'Staff' },
    { value: 'user', label: 'User' }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  // Fetch user data from API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        const userData = response.data.data || [];
        setUsers(userData);

        // Save to cache
        userMemoryCache.set('userData', userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      position: '',
      employee_id: '',
      password: '',
      password_confirmation: '',
      bio: '',
      is_active: true
    });
    setErrors({});
  };

  // Handle form operations
  const openForm = (mode, userItem = null) => {
    setFormMode(mode);
    setSelectedUser(userItem);

    if (mode === 'edit' && userItem) {
      setFormData({
        name: userItem.name || '',
        email: userItem.email || '',
        phone: userItem.phone || '',
        role: userItem.role || '',
        position: userItem.position || '',
        employee_id: userItem.employee_id || '',
        password: '',
        password_confirmation: '',
        bio: userItem.bio || '',
        is_active: userItem.is_active !== undefined ? userItem.is_active : true
      });
    } else if (mode === 'create') {
      resetForm();
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    resetForm();
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAllItems(checked);
    if (checked) {
      setSelectedItems(users.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
      setSelectAllItems(false);
    }
  };

  // Update selectAll when individual items change
  useEffect(() => {
    if (selectedItems.length === users.length && users.length > 0) {
      setSelectAllItems(true);
    } else {
      setSelectAllItems(false);
    }
  }, [selectedItems, users]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedItems.length} pengguna yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      // Show loading alert
      Swal.fire({
        title: 'Menghapus Pengguna...',
        text: `Sedang menghapus ${selectedItems.length} pengguna yang dipilih`,
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await Promise.all(selectedItems.map(id => api.delete(`/users/${id}`)));

        await fetchUsers();
        setSelectedItems([]);
        setSelectAllItems(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${selectedItems.length} pengguna berhasil dihapus!`,
          confirmButtonColor: '#10B981',
          timer: 5000, // Increased from 3000 to 5000ms
          timerProgressBar: true,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      } catch (err) {
        console.error('Error deleting items:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus',
          confirmButtonColor: '#EF4444',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  // Helper function to safely check if a string field is empty
  const isFieldEmpty = (field) => {
    return !field || typeof field !== 'string' || !field.trim();
  };

  const validateForm = () => {
    const newErrors = {};

    if (isFieldEmpty(formData.name)) newErrors.name = 'Nama harus diisi';
    if (formData.name && formData.name.length < 3) newErrors.name = 'Nama minimal 3 karakter';
    if (formData.name && formData.name.length > 255) newErrors.name = 'Nama maksimal 255 karakter';
    
    if (isFieldEmpty(formData.email)) newErrors.email = 'Email harus diisi';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (formData.phone && !/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    
    if (!formData.role) newErrors.role = 'Role harus dipilih';
    
    if (formMode === 'create') {
      if (isFieldEmpty(formData.password)) newErrors.password = 'Password harus diisi';
      if (formData.password && formData.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
    }
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const isCreate = formMode === 'create';

    // Show loading alert
    Swal.fire({
      title: isCreate ? 'Menyimpan Pengguna...' : 'Memperbarui Pengguna...',
      text: isCreate ? `Sedang menyimpan "${formData.name}"` : `Sedang memperbarui "${formData.name}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
        position: formData.position || null,
        employee_id: formData.employee_id || null,
        bio: formData.bio || null,
        is_active: formData.is_active
      };

      if (formMode === 'create') {
        submitData.password = formData.password;
        submitData.password_confirmation = formData.password_confirmation;
        await api.post('/users', submitData);
      } else if (formMode === 'edit') {
        if (formData.password) {
          submitData.password = formData.password;
          submitData.password_confirmation = formData.password_confirmation;
        }
        await api.put(`/users/${selectedUser.id}`, submitData);
      }

      // Force refresh data
      await fetchUsers();

      // Close form
      closeForm();

      // Show success alert with longer timer
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: isCreate ? 'Pengguna berhasil ditambahkan!' : 'Pengguna berhasil diperbarui!',
        confirmButtonColor: '#10B981',
        timer: 5000, // Increased from 3000 to 5000ms
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error('Error saving user:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.error || err.message || 'Terjadi kesalahan saat menyimpan data',
        confirmButtonColor: '#EF4444',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userItem) => {
    if (!userItem || !userItem.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Data pengguna tidak valid',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus pengguna "${userItem.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    setDeletingId(userItem.id);

    // Show loading alert
    Swal.fire({
      title: 'Menghapus Pengguna...',
      text: `Sedang menghapus "${userItem.name}"`,
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await api.delete(`/users/${userItem.id}`);

      if (response.data.success) {
        await fetchUsers();

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pengguna berhasil dihapus!',
          confirmButtonColor: '#10B981',
          timer: 5000, // Increased from 3000 to 5000ms
          timerProgressBar: true,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: response.data.message || response.data.error || 'Terjadi kesalahan',
          confirmButtonColor: '#EF4444',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);

      let errorMessage = 'Terjadi kesalahan saat menghapus data';
      
      if (err.response?.status === 404) {
        errorMessage = 'Pengguna tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        await fetchUsers();
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error: ' + (err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan server');
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || errorMessage;
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Only redirect if not authenticated, no loading screen
  if (!authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {showForm ? (
                    <button
                      onClick={() => setShowForm(false)}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                    >
                      Kelola Pengguna
                    </button>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Kelola Pengguna
                    </span>
                  )}
                </div>
              </li>
              {showForm && (
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {formMode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
              <p className="text-gray-600 mt-2">
                Kelola akun pengguna dan hak akses sistem
                {users.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {users.length} pengguna
                  </span>
                )}
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {selectedItems.length} dipilih
                  </span>
                )}
              </p>
            </div>
            {!showForm && (
              <Button
                onClick={() => openForm('create')}
                variant="primary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Tambah Pengguna
              </Button>
            )}
            {showForm && (
              <Button
                onClick={closeForm}
                variant="outline"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Kembali ke Daftar
              </Button>
            )}
          </div>

          {/* User Table - Only show when not in form mode */}
          {!showForm && (
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Pengguna</h3>
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleBulkDelete}
                      variant="danger"
                      size="sm"
                      disabled={isSubmitting || isDeleting}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      }
                    >
                      Hapus {selectedItems.length} Item
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItems([]);
                        setSelectAllItems(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p>Belum ada pengguna yang ditambahkan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectAllItems}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telepon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jabatan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {/* Checkbox */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* Number */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {index + 1}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {item.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                {item.employee_id && (
                                  <div className="text-sm text-gray-500">
                                    ID: {item.employee_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <a
                                href={`mailto:${item.email}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {item.email}
                              </a>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.phone ? (
                                <a
                                  href={`tel:${item.phone}`}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  {item.phone}
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.role === 'admin' ? 'bg-red-100 text-red-800' :
                              item.role === 'kepala_sekolah' ? 'bg-purple-100 text-purple-800' :
                              item.role === 'guru' ? 'bg-blue-100 text-blue-800' :
                              item.role === 'staff' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {roles.find(r => r.value === item.role)?.label || item.role}
                            </span>
                          </td>

                          {/* Position */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.position || '-'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.is_active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Nonaktif
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => openForm('edit', item)}
                                variant="outline"
                                size="sm"
                                disabled={isSubmitting || (isDeleting && deletingId === item.id)}
                                icon={
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDelete(item)}
                                variant="danger"
                                size="sm"
                                disabled={isSubmitting || (isDeleting && deletingId === item.id)}
                                loading={isDeleting && deletingId === item.id}
                                icon={
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                }
                              >
                                {isDeleting && deletingId === item.id ? 'Menghapus...' : 'Hapus'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Create/Edit Form - Show when in form mode */}
          {showForm && (
            <Card padding="lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {formMode === 'create' ? 'Tambahkan pengguna baru ke sistem' : 'Edit informasi pengguna'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="user-name" className="block text-sm font-semibold text-gray-800">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="user-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="user-email" className="block text-sm font-semibold text-gray-800">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="user-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="nama@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone and Role Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="user-phone" className="block text-sm font-semibold text-gray-800">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="user-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="081234567890"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm">{errors.phone}</p>
                    )}
                    <p className="text-xs text-gray-500">Format: 08xxxxxxxxx atau +628xxxxxxxxx</p>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label htmlFor="user-role" className="block text-sm font-semibold text-gray-800">
                      Role *
                    </label>
                    <select
                      id="user-role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.role ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Role</option>
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p className="text-red-600 text-sm">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Position and Employee ID Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position */}
                  <div className="space-y-2">
                    <label htmlFor="user-position" className="block text-sm font-semibold text-gray-800">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      id="user-position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                      placeholder="Contoh: Guru Matematika"
                    />
                  </div>

                  {/* Employee ID */}
                  <div className="space-y-2">
                    <label htmlFor="user-employee-id" className="block text-sm font-semibold text-gray-800">
                      ID Pegawai
                    </label>
                    <input
                      type="text"
                      id="user-employee-id"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                      placeholder="Contoh: EMP001"
                    />
                  </div>
                </div>

                {/* Password Fields - Only show for create or when editing password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="user-password" className="block text-sm font-semibold text-gray-800">
                      Password {formMode === 'create' ? '*' : '(Kosongkan jika tidak ingin mengubah)'}
                    </label>
                    <input
                      type="password"
                      id="user-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Masukkan password"
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500">Minimal 8 karakter</p>
                  </div>

                  {/* Password Confirmation */}
                  <div className="space-y-2">
                    <label htmlFor="user-password-confirmation" className="block text-sm font-semibold text-gray-800">
                      Konfirmasi Password {formMode === 'create' ? '*' : ''}
                    </label>
                    <input
                      type="password"
                      id="user-password-confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password_confirmation ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Ulangi password"
                    />
                    {errors.password_confirmation && (
                      <p className="text-red-600 text-sm">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label htmlFor="user-bio" className="block text-sm font-semibold text-gray-800">
                    Bio
                  </label>
                  <textarea
                    id="user-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300 resize-vertical"
                    placeholder="Tulis bio singkat pengguna..."
                  />
                  <p className="text-xs text-gray-500">Maksimal 1000 karakter</p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Status Akun
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="user-active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="user-active" className="ml-2 text-sm text-gray-700">
                      <span className="font-medium">Akun Aktif</span>
                      <span className="text-gray-500 ml-1">- Pengguna dapat login dan mengakses sistem</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={closeForm}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting
                      ? (formMode === 'create' ? 'Menyimpan...' : 'Memperbarui...')
                      : (formMode === 'create' ? 'Simpan' : 'Update')
                    }
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
};

export default PenggunaManagement;
