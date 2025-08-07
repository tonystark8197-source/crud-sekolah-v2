import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AdminLayout from '../../components/admin/AdminLayout';
import { Input, Textarea, Select, Modal } from '../../components/ui';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { api } from '../../services/api';
import { useAdminAuth, AuthErrorComponent } from '../../hooks/useAdminAuth';

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

// Validation schema
const userSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nama harus diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  email: yup
    .string()
    .email('Format email tidak valid')
    .required('Email harus diisi'),
  phone: yup
    .string()
    .nullable()
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor telepon tidak valid'),
  password: yup
    .string()
    .when('isEdit', {
      is: false,
      then: (schema) => schema.required('Password harus diisi').min(8, 'Password minimal 8 karakter'),
      otherwise: (schema) => schema.nullable().min(8, 'Password minimal 8 karakter')
    }),
  password_confirmation: yup
    .string()
    .when('password', {
      is: (password) => password && password.length > 0,
      then: (schema) => schema.required('Konfirmasi password harus diisi').oneOf([yup.ref('password')], 'Konfirmasi password tidak cocok'),
      otherwise: (schema) => schema.nullable()
    }),
  role: yup
    .string()
    .required('Role harus dipilih')
    .oneOf(['admin', 'kepala_sekolah', 'guru', 'staff', 'user'], 'Role tidak valid'),
  position: yup
    .string()
    .nullable()
    .max(100, 'Jabatan maksimal 100 karakter'),
  employee_id: yup
    .string()
    .nullable()
    .max(50, 'ID Pegawai maksimal 50 karakter'),
  bio: yup
    .string()
    .nullable()
    .max(1000, 'Bio maksimal 1000 karakter'),
  is_active: yup
    .boolean()
});

const UserManagement = () => {
  const { isAuthenticated, isLoading: authLoading, redirectToLogin } = useAdminAuth();

  // Initialize with cached data - always show table immediately
  const cachedUsers = getCachedUserData();
  const [users, setUsers] = useState(cachedUsers);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 items per page

  // Bulk actions states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-800' },
    { value: 'kepala_sekolah', label: 'Kepala Sekolah', color: 'bg-red-100 text-red-800' },
    { value: 'guru', label: 'Guru', color: 'bg-blue-100 text-blue-800' },
    { value: 'staff', label: 'Staff', color: 'bg-green-100 text-green-800' }
  ];
  const statuses = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' }
  ];

  // React Hook Form
  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors: formErrors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      role: '',
      position: '',
      employee_id: '',
      bio: '',
      is_active: true
    }
  });

  const watchedPassword = watch('password');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  // Filter users on frontend (no API calls)
  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (selectedRole !== 'all' && user.role !== selectedRole) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      const userStatus = user.is_active ? 'active' : 'inactive';
      if (userStatus !== selectedStatus) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]); // Clear selections when filters change
    setSelectAll(false);
    setShowBulkActions(false);
  }, [searchTerm, selectedRole, selectedStatus]);

  // Bulk actions functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkActions(false);
    } else {
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const selectableUsers = paginatedUsers.filter(user => user.id !== currentUser.id);
      setSelectedUsers(selectableUsers.map(user => user.id));
      setSelectAll(true);
      setShowBulkActions(selectableUsers.length > 0);
    }
  };

  const handleSelectUser = (userId) => {
    const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (userId === currentUser.id) return; // Prevent selecting own account

    if (selectedUsers.includes(userId)) {
      const newSelected = selectedUsers.filter(id => id !== userId);
      setSelectedUsers(newSelected);
      setSelectAll(false);
      setShowBulkActions(newSelected.length > 0);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      const selectableUsers = paginatedUsers.filter(user => user.id !== currentUser.id);
      setSelectAll(newSelected.length === selectableUsers.length);
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedUsers.length} pengguna yang dipilih?`;
    if (!confirm(confirmMessage)) return;

    try {
      const deletePromises = selectedUsers.map(userId =>
        api.delete(`/users/${userId}`)
      );

      await Promise.all(deletePromises);
      await refreshData();
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkActions(false);
      alert(`${selectedUsers.length} pengguna berhasil dihapus!`);
    } catch (err) {
      console.error('Error bulk deleting users:', err);
      alert('Terjadi kesalahan saat menghapus pengguna: ' + err.message);
    }
  };

  // Manual refresh function for CRUD operations
  const refreshData = async () => {
    if (!isAuthenticated) return;

    setError(null);

    try {
      // Refreshing users data in background
      const response = await api.get('/users');
      if (response.data.success) {
        const userData = response.data.data || [];
        setUsers(userData);
        setHasTriedFetch(true);

        // Save to cache
        userMemoryCache.set('userData', userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        setError('Gagal memuat data pengguna');
        setHasTriedFetch(true);
      }
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Terjadi kesalahan saat memuat data pengguna: ' + err.message);
      setHasTriedFetch(true);
      // Keep cached data
    }
  };

  // Load data ONLY ONCE on component mount (page refresh)
  useEffect(() => {
    // Only fetch data if authenticated and not already loaded
    if (!isAuthenticated || authLoading) return;

    const loadUsers = async () => {
      setError(null);

      try {

        const response = await api.get('/users');
        if (response.data.success) {
          const userData = response.data.data || [];
          setUsers(userData);
          setHasTriedFetch(true);

          // Save to cache
          userMemoryCache.set('userData', userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          setError('Gagal memuat data pengguna');
          setHasTriedFetch(true);
        }
      } catch (err) {
        // Error loading users in background

        // If it's a 401 error, token is invalid - redirect to login
        if (err.message.includes('401') || err.message.includes('Authentication required')) {
          console.log('Token invalid, redirecting to login...');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          redirectToLogin();
          return;
        }

        setError('Terjadi kesalahan saat memuat data pengguna: ' + err.message);
        setHasTriedFetch(true);
        // Keep cached data
      }
    };

    loadUsers();
  }, [isAuthenticated, authLoading, redirectToLogin]);

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);

    if (mode === 'edit' && user) {
      // Set form values for editing
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone || '');
      setValue('role', user.role);
      setValue('position', user.position || '');
      setValue('employee_id', user.employee_id || '');
      setValue('bio', user.bio || '');
      setValue('is_active', user.is_active);
      setValue('isEdit', true);
    } else if (mode === 'create') {
      reset();
      setValue('isEdit', false);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    reset();
  };

  const handleFormSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        const response = await api.post('/users', data);
        if (response.data.success) {
          await refreshData(); // Refresh data
          closeModal();
          alert('Pengguna berhasil ditambahkan!');
        }
      } else if (modalMode === 'edit') {
        const response = await api.put(`/users/${selectedUser.id}`, data);
        if (response.data.success) {
          await refreshData(); // Refresh data
          closeModal();
          alert('Pengguna berhasil diperbarui!');
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Terjadi kesalahan: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${selectedUser.name}"?`)) {
      try {
        const response = await api.delete(`/users/${selectedUser.id}`);
        if (response.data.success) {
          await refreshData(); // Refresh data
          closeModal();
          alert('Pengguna berhasil dihapus!');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Terjadi kesalahan: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleToggleStatus = async (user) => {
    // Prevent toggling own status
    const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (user.id === currentUser.id) {
      alert('Anda tidak dapat mengubah status akun Anda sendiri');
      return;
    }

    // Confirm action
    const action = user.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!confirm(`Apakah Anda yakin ingin ${action} pengguna ${user.name}?`)) {
      return;
    }

    try {
      console.log(`Toggling status for user ${user.id}: ${user.name}`);
      const response = await api.patch(`/users/${user.id}/toggle-status`);

      if (response.data.success) {
        // Update user in local state instead of refetching all data
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === user.id
              ? { ...u, is_active: !u.is_active }
              : u
          )
        );
        alert(`Status pengguna ${user.name} berhasil ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}!`);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      const errorMessage = err.response?.data?.error || err.message;

      if (errorMessage.includes('Cannot deactivate your own account')) {
        alert('Anda tidak dapat menonaktifkan akun Anda sendiri');
      } else {
        alert('Terjadi kesalahan: ' + errorMessage);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // filteredUsers is now defined above with comprehensive filtering

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Belum pernah login';
    const date = new Date(lastLogin);
    return date.toLocaleDateString('id-ID') + ' ' + date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Only redirect if not authenticated, no loading screen
  if (!authLoading && !isAuthenticated) {
    return null; // Let redirect happen immediately
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-8">
          {/* Desktop Header (>= 900px) */}
          <div className="hidden min-[900px]:flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
              <p className="text-gray-600 mt-2">
                Kelola akun pengguna sistem sekolah
                {filteredUsers.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </span>
                )}
                {selectedUsers.length > 0 && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {selectedUsers.length} dipilih
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Desktop Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus {selectedUsers.length} Item
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUsers([]);
                      setSelectAll(false);
                      setShowBulkActions(false);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition duration-300"
                  >
                    Batal
                  </button>
                </div>
              )}
              <button
                onClick={() => openModal('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah User
              </button>
            </div>
          </div>

          {/* Mobile Header (< 900px) */}
          <div className="min-[900px]:hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  {selectedUsers.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {selectedUsers.length} dipilih
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => openModal('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah
              </button>
            </div>

            {/* Mobile Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      {selectedUsers.length} item dipilih
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition duration-300"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUsers([]);
                        setSelectAll(false);
                        setShowBulkActions(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm font-medium transition duration-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>



          {/* Desktop Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="hidden sm:flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} pengguna dipilih
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus {selectedUsers.length} Item
                </button>
                <button
                  onClick={() => {
                    setSelectedUsers([]);
                    setSelectAll(false);
                    setShowBulkActions(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                >
                  Batal Pilihan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              {(error.includes('Authentication') || error.includes('401') || error.includes('500')) && (
                <button
                  onClick={() => {
                    console.log('Clearing tokens and redirecting to login...');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    redirectToLogin();
                  }}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-200"
                >
                  Login Ulang
                </button>
              )}
            </div>
          </div>
        )}

        {/* Remove loading state - always show content immediately */}

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 min-w-64">
              <input
                id="user-search"
                name="userSearch"
                type="text"
                placeholder="Cari berdasarkan nama, email, atau ID pegawai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Role</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>


        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
              <thead className="bg-gray-50">
                <tr>
                  {/* Checkbox Column */}
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  {/* No Column - Hidden on mobile */}
                  <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    User
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Role
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[140px]">
                    Last Login
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[120px]">
                    Bergabung
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => {
                    const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
                    const isOwnAccount = user.id === currentUser.id;
                    const isSelected = selectedUsers.includes(user.id);
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                        {/* Checkbox Column */}
                        <td className="px-2 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            disabled={isOwnAccount}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                              isOwnAccount ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                        </td>
                        {/* No Column - Hidden on mobile */}
                        <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-900 font-medium">
                          {rowNumber}
                        </td>
                        <td className="px-3 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.is_active ? 'active' : 'inactive')}`}>
                        {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                      {formatLastLogin(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal('view', user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Lihat"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal('edit', user)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {(() => {
                          const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
                          return user.id !== currentUser.id && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1 ${user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                              title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                          {user.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => openModal('delete', user)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                            ? 'Tidak ada user ditemukan'
                            : 'Belum ada Pengguna'
                          }
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                            ? 'Tidak ada user yang sesuai dengan filter yang dipilih'
                            : 'Mulai dengan menambahkan pengguna pertama'
                          }
                        </p>
                        {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedRole('all');
                              setSelectedStatus('all');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              {/* Mobile Pagination */}
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 flex items-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{startIndex + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredUsers.length)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{filteredUsers.length}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                        currentPage === 1
                          ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                        currentPage === totalPages
                          ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen && (modalMode === 'create' || modalMode === 'edit')}
          onClose={closeModal}
          title={modalMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
          size="lg"
        >
          <form onSubmit={onSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                required
                error={formErrors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="nama@sman1jakarta.sch.id"
                autoComplete="email"
                required
                error={formErrors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon"
                type="tel"
                placeholder="081234567890"
                autoComplete="tel"
                error={formErrors.phone?.message}
                {...register('phone')}
              />

              <Select
                label="Role"
                placeholder="Pilih Role"
                options={roles}
                required
                error={formErrors.role?.message}
                {...register('role')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Jabatan"
                placeholder="Contoh: Guru Matematika"
                autoComplete="organization-title"
                error={formErrors.position?.message}
                {...register('position')}
              />

              <Input
                label="ID Pegawai"
                placeholder="NIP/NIK"
                autoComplete="off"
                error={formErrors.employee_id?.message}
                {...register('employee_id')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={modalMode === 'create' ? 'Password' : 'Password (Kosongkan jika tidak ingin mengubah)'}
                type="password"
                placeholder="Masukkan password"
                autoComplete="new-password"
                required={modalMode === 'create'}
                error={formErrors.password?.message}
                {...register('password')}
              />

              {watchedPassword && (
                <Input
                  label="Konfirmasi Password"
                  type="password"
                  placeholder="Konfirmasi password"
                  autoComplete="new-password"
                  required={!!watchedPassword}
                  error={formErrors.password_confirmation?.message}
                  {...register('password_confirmation')}
                />
              )}
            </div>

            <Textarea
              label="Bio"
              placeholder="Deskripsi singkat tentang pengguna..."
              rows={3}
              autoComplete="off"
              error={formErrors.bio?.message}
              {...register('bio')}
            />

            {/* Status Aktif Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Status Pengguna
              </label>
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  id="user-is-active"
                  checked={watch('is_active')}
                  onChange={(checked) => setValue('is_active', checked)}
                  theme="light"
                />
                <span className="text-sm text-gray-600">
                  {watch('is_active') ? 'Pengguna aktif dan dapat login' : 'Pengguna tidak aktif'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                {modalMode === 'create' ? 'Simpan' : 'Update'}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={isModalOpen && modalMode === 'view'}
          onClose={closeModal}
          title="Detail User"
          size="md"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role:</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadge(selectedUser.role).color}`}>
                    {getRoleBadge(selectedUser.role).label}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status:</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusBadge(selectedUser.is_active ? 'active' : 'inactive')}`}>
                    {selectedUser.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Login:</label>
                <p className="text-gray-900 mt-1">{formatLastLogin(selectedUser.last_login)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bergabung:</label>
                <p className="text-gray-900 mt-1">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isModalOpen && modalMode === 'delete'}
          onClose={closeModal}
          title="Hapus User"
          size="sm"
        >
          {selectedUser && (
            <div>
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <p className="text-sm font-medium text-gray-900 text-center mt-2">
                  {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}
        </Modal>
    </AdminLayout>
  );
};

export default UserManagement;
