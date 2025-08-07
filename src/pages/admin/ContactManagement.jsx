import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { Card, Button } from '../../components/ui';
import { api } from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Swal from 'sweetalert2';

// Memory cache untuk contact data
const contactMemoryCache = new Map();

// Cache untuk contact data
const getCachedContactData = () => {
  try {
    // Check memory cache first
    if (contactMemoryCache.has('contactData')) {
      return contactMemoryCache.get('contactData');
    }

    // Then check localStorage
    const cached = localStorage.getItem('contactData');
    if (cached) {
      const parsedData = JSON.parse(cached);
      contactMemoryCache.set('contactData', parsedData);
      return parsedData;
    }
  } catch {
    // Silent error handling
  }

  // Return empty array instead of null to always show table
  return [];
};

const ContactManagement = () => {
  const { isAuthenticated, isLoading: authLoading, redirectToLogin } = useAdminAuth();

  // Initialize with cached data - always show table immediately
  const cachedContacts = getCachedContactData();
  const [contacts, setContacts] = useState(cachedContacts);

  // Form switching states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'template'
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const [errors, setErrors] = useState({});

  // Selection states for bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAllItems, setSelectAllItems] = useState(false);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Template WA data
  const [templateData, setTemplateData] = useState({
    message: '',
    selectedContactId: null
  });

  const categories = ['Pendaftaran', 'Akademik', 'Administrasi', 'Fasilitas', 'Ekstrakurikuler', 'Lainnya'];



  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  // Fetch contact data from API
  const fetchContacts = useCallback(async () => {
    try {
      const response = await api.get('/contacts/admin/all');
      if (response.data.success) {
        const contactData = response.data.data || [];
        setContacts(contactData);

        // Save to cache
        contactMemoryCache.set('contactData', contactData);
        localStorage.setItem('contactData', JSON.stringify(contactData));
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
      category: ''
    });
    setErrors({});
  };

  // Handle form operations
  const openForm = (mode, contactItem = null) => {
    setFormMode(mode);
    setSelectedContact(contactItem);

    if (mode === 'edit' && contactItem) {
      setFormData({
        name: contactItem.name || '',
        phone: contactItem.phone || '',
        email: contactItem.email || '',
        subject: contactItem.subject || '',
        message: contactItem.message || '',
        category: contactItem.category || ''
      });
    } else if (mode === 'create') {
      resetForm();
    } else if (mode === 'template') {
      // Reset template data
      setTemplateData({
        message: '',
        selectedContactId: null
      });
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedContact(null);
    resetForm();
  };

  // Handle send WhatsApp
  const handleSendWhatsApp = (contactItem) => {
    // Generate template message
    const templateMessage = `Halo ${contactItem.name},

Terima kasih telah menghubungi kami melalui website sekolah.

Pesan Anda:
Subjek: ${contactItem.subject || '-'}
Kategori: ${contactItem.category || '-'}
Pesan: ${contactItem.message || '-'}

Kami akan segera merespon pertanyaan Anda. Jika ada yang mendesak, silakan hubungi kami langsung.

Terima kasih.
Tim Admin Sekolah`;

    // Open WhatsApp with pre-filled message
    const phoneNumber = contactItem.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(templateMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle checkbox selection
  const handleSelectAll = (checked) => {
    setSelectAllItems(checked);
    if (checked) {
      setSelectedItems(contacts.map(item => item.id));
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
    if (selectedItems.length === contacts.length && contacts.length > 0) {
      setSelectAllItems(true);
    } else {
      setSelectAllItems(false);
    }
  }, [selectedItems, contacts]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedItems.length} kontak yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await Promise.all(selectedItems.map(id => api.delete(`/contacts/${id}`)));

        await fetchContacts();
        setSelectedItems([]);
        setSelectAllItems(false);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${selectedItems.length} kontak berhasil dihapus!`,
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        });
      } catch (err) {
        console.error('Error deleting items:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setIsDeleting(false);
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
    if (formData.name && formData.name.length < 2) newErrors.name = 'Nama minimal 2 karakter';
    if (formData.name && formData.name.length > 100) newErrors.name = 'Nama maksimal 100 karakter';

    if (isFieldEmpty(formData.phone)) newErrors.phone = 'Nomor WhatsApp harus diisi';
    if (formData.phone && !/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor WhatsApp tidak valid';
    }

    if (isFieldEmpty(formData.email)) newErrors.email = 'Email harus diisi';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (isFieldEmpty(formData.subject)) newErrors.subject = 'Subjek harus diisi';
    if (formData.subject && formData.subject.length < 5) newErrors.subject = 'Subjek minimal 5 karakter';
    if (formData.subject && formData.subject.length > 200) newErrors.subject = 'Subjek maksimal 200 karakter';

    if (isFieldEmpty(formData.message)) newErrors.message = 'Pesan harus diisi';
    if (formData.message && formData.message.length < 10) newErrors.message = 'Pesan minimal 10 karakter';
    if (formData.message && formData.message.length > 1000) newErrors.message = 'Pesan maksimal 1000 karakter';

    if (!formData.category) newErrors.category = 'Kategori harus dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const isCreate = formMode === 'create';

      const submitData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category
      };

      if (formMode === 'create') {
        await api.post('/contacts', submitData);
      } else if (formMode === 'edit') {
        await api.put(`/contacts/${selectedContact.id}`, submitData);
      }

      // Force refresh data
      await fetchContacts();

      // Close form and show success
      closeForm();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: isCreate ? 'Kontak berhasil ditambahkan!' : 'Kontak berhasil diperbarui!',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error saving contact:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.error || err.message || 'Terjadi kesalahan saat menyimpan data',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contactItem) => {
    if (!contactItem || !contactItem.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Data kontak tidak valid',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus kontak "${contactItem.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setDeletingId(contactItem.id);
    setIsDeleting(true);

    try {
      const response = await api.delete(`/contacts/${contactItem.id}`);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Kontak berhasil dihapus!',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        });
        await fetchContacts();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: response.data.message || response.data.error || 'Terjadi kesalahan',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);

      let errorMessage = 'Terjadi kesalahan saat menghapus data';

      if (err.response?.status === 404) {
        errorMessage = 'Kontak tidak ditemukan. Mungkin sudah dihapus sebelumnya.';
        await fetchContacts();
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
      setDeletingId(null);
      setIsDeleting(false);
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
                      Kelola Kontak
                    </button>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Kelola Kontak
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
                      {formMode === 'create' ? 'Tambah Kontak' :
                       formMode === 'edit' ? 'Edit Kontak' :
                       'Template WhatsApp'}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Kontak</h1>
              <p className="text-gray-600 mt-2">
                Kelola kontak WhatsApp dan informasi sekolah
                {contacts.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {contacts.length} kontak
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
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => openForm('template')}
                  variant="outline"
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  }
                >
                  Template WA
                </Button>
                <Button
                  onClick={() => openForm('create')}
                  variant="primary"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Tambah Kontak
                </Button>
              </div>
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

          {/* Contact Table - Only show when not in form mode */}
          {!showForm && (
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Kontak</h3>
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleBulkDelete}
                      variant="danger"
                      size="sm"
                      disabled={isDeleting || isSubmitting}
                      icon={
                        isDeleting ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )
                      }
                    >
                      {isDeleting ? 'Menghapus...' : `Hapus ${selectedItems.length} Item`}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItems([]);
                        setSelectAllItems(false);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={isDeleting || isSubmitting}
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Belum ada kontak yang ditambahkan</p>
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
                          WhatsApp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subjek
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pesan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kirim WA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((item, index) => (
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
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </td>

                          {/* WhatsApp */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <a
                                href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                {item.phone}
                              </a>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.email ? (
                                <a
                                  href={`mailto:${item.email}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {item.email}
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>

                          {/* Subject */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={item.subject}>
                              {item.subject || '-'}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category || '-'}
                            </span>
                          </td>

                          {/* Message */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={item.message}>
                              {item.message ? (item.message.length > 50 ? item.message.substring(0, 50) + '...' : item.message) : '-'}
                            </div>
                          </td>

                          {/* Send WhatsApp */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              onClick={() => handleSendWhatsApp(item)}
                              variant="success"
                              size="sm"
                              icon={
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              }
                            >
                              Kirim
                            </Button>
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
                                icon={
                                  (isDeleting && deletingId === item.id) ? (
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )
                                }
                              >
                                {(isDeleting && deletingId === item.id) ? 'Menghapus...' : 'Hapus'}
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

          {/* Create/Edit Form - Show when in create/edit mode */}
          {showForm && (formMode === 'create' || formMode === 'edit') && (
            <Card padding="lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formMode === 'create' ? 'Tambah Kontak Baru' : 'Edit Kontak'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {formMode === 'create' ? 'Tambahkan kontak WhatsApp baru untuk sekolah' : 'Edit informasi kontak'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-800">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
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

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-800">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
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
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-800">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
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

                {/* Category and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <label htmlFor="contact-category" className="block text-sm font-semibold text-gray-800">
                      Kategori *
                    </label>
                    <select
                      id="contact-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-600 text-sm">{errors.category}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-800">
                      Subjek *
                    </label>
                    <input
                      type="text"
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Subjek pesan"
                    />
                    {errors.subject && (
                      <p className="text-red-600 text-sm">{errors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-800">
                    Pesan *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
                      errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Tulis pesan di sini..."
                  />
                  {errors.message && (
                    <p className="text-red-600 text-sm">{errors.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimal 10 karakter, maksimal 1000 karakter</p>
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
                    icon={isSubmitting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                  >
                    {isSubmitting ? 'Menyimpan...' : (formMode === 'create' ? 'Simpan' : 'Update')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Template WhatsApp Form - Show when in template mode */}
          {showForm && formMode === 'template' && (
            <Card padding="lg">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Template WhatsApp
                </h3>
                <p className="text-gray-600 mt-1">
                  Buat template pesan WhatsApp untuk mengirim ke kontak
                </p>
              </div>

              <div className="space-y-6">
                {/* Select Contact */}
                <div className="space-y-2">
                  <label htmlFor="template-contact" className="block text-sm font-semibold text-gray-800">
                    Pilih Kontak *
                  </label>
                  <select
                    id="template-contact"
                    value={templateData.selectedContactId || ''}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, selectedContactId: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                  >
                    <option value="">Pilih kontak untuk dikirim pesan</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Message */}
                <div className="space-y-2">
                  <label htmlFor="template-message" className="block text-sm font-semibold text-gray-800">
                    Template Pesan *
                  </label>
                  <textarea
                    id="template-message"
                    value={templateData.message}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, message: e.target.value }))}
                    rows={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300 resize-vertical"
                    placeholder="Tulis template pesan WhatsApp di sini...

Contoh:
Halo [Nama],

Terima kasih telah menghubungi kami melalui website sekolah.

Pesan Anda:
Subjek: [Subjek]
Kategori: [Kategori]
Pesan: [Pesan]

Kami akan segera merespon pertanyaan Anda.

Terima kasih.
Tim Admin Sekolah"
                  />
                  <p className="text-xs text-gray-500">
                    Gunakan placeholder: [Nama], [Subjek], [Kategori], [Pesan] untuk data dinamis
                  </p>
                </div>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Template Cepat
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => setTemplateData(prev => ({
                        ...prev,
                        message: `Halo [Nama],

Terima kasih telah menghubungi kami melalui website sekolah.

Pesan Anda:
Subjek: [Subjek]
Kategori: [Kategori]
Pesan: [Pesan]

Kami akan segera merespon pertanyaan Anda. Jika ada yang mendesak, silakan hubungi kami langsung.

Terima kasih.
Tim Admin Sekolah`
                      }))}
                      variant="outline"
                      size="sm"
                    >
                      Template Standar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setTemplateData(prev => ({
                        ...prev,
                        message: `Halo [Nama],

Terima kasih atas pertanyaan Anda mengenai [Kategori].

Kami dengan senang hati akan membantu menjawab pertanyaan Anda. Tim kami akan segera menghubungi Anda kembali dalam 1x24 jam.

Salam hangat,
Tim Admin Sekolah`
                      }))}
                      variant="outline"
                      size="sm"
                    >
                      Template Singkat
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {templateData.selectedContactId && templateData.message && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Preview Pesan
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {(() => {
                          const selectedContact = contacts.find(c => c.id === parseInt(templateData.selectedContactId));
                          if (!selectedContact) return templateData.message;

                          return templateData.message
                            .replace(/\[Nama\]/g, selectedContact.name || '')
                            .replace(/\[Subjek\]/g, selectedContact.subject || '-')
                            .replace(/\[Kategori\]/g, selectedContact.category || '-')
                            .replace(/\[Pesan\]/g, selectedContact.message || '-');
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={closeForm}
                    variant="outline"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!templateData.selectedContactId || !templateData.message) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Data Tidak Lengkap',
                          text: 'Pilih kontak dan isi template pesan terlebih dahulu',
                          confirmButtonColor: '#EF4444'
                        });
                        return;
                      }

                      const selectedContact = contacts.find(c => c.id === parseInt(templateData.selectedContactId));
                      if (!selectedContact) return;

                      const finalMessage = templateData.message
                        .replace(/\[Nama\]/g, selectedContact.name || '')
                        .replace(/\[Subjek\]/g, selectedContact.subject || '-')
                        .replace(/\[Kategori\]/g, selectedContact.category || '-')
                        .replace(/\[Pesan\]/g, selectedContact.message || '-');

                      const phoneNumber = selectedContact.phone.replace(/[^0-9]/g, '');
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
                      window.open(whatsappUrl, '_blank');

                      Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'WhatsApp telah dibuka dengan template pesan',
                        confirmButtonColor: '#10B981',
                        timer: 2000,
                        timerProgressBar: true
                      });
                    }}
                    variant="success"
                    icon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    }
                  >
                    Kirim WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </AdminLayout>
    </ErrorBoundary>
  );
};

export default ContactManagement;
