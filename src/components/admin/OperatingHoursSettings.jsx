import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Swal from 'sweetalert2';

const OperatingHoursSettings = () => {
  const [saving, setSaving] = useState(false);
  const [operatingHours, setOperatingHours] = useState([
    { day: 'Senin - Jumat', start_time: '07:00', end_time: '16:00', is_open: true },
    { day: 'Sabtu', start_time: '07:00', end_time: '12:00', is_open: true },
    { day: 'Minggu', start_time: '', end_time: '', is_open: false }
  ]);
  const [emergencyContact, setEmergencyContact] = useState('(021) 123-4569');
  const [notes, setNotes] = useState('Untuk keperluan mendesak di luar jam operasional, silakan hubungi nomor darurat');

  // Load operating hours from API
  useEffect(() => {
    loadOperatingHours();
  }, []);

  const loadOperatingHours = async () => {
    try {
      const response = await api.get('/admin/operating-hours');
      if (response.data.success) {
        const data = response.data.data;
        if (data.operating_hours) {
          setOperatingHours(data.operating_hours);
        }
        if (data.emergency_contact) {
          setEmergencyContact(data.emergency_contact);
        }
        if (data.notes) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error loading operating hours:', error);
      // Use default values if API fails - already set in useState
    }
  };

  const handleTimeChange = (index, field, value) => {
    const newHours = [...operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOperatingHours(newHours);
  };

  const handleToggleDay = (index) => {
    const newHours = [...operatingHours];
    newHours[index] = { 
      ...newHours[index], 
      is_open: !newHours[index].is_open,
      start_time: !newHours[index].is_open ? '07:00' : '',
      end_time: !newHours[index].is_open ? '16:00' : ''
    };
    setOperatingHours(newHours);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Show loading alert
      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang menyimpan pengaturan jam operasional',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const data = {
        operating_hours: operatingHours,
        emergency_contact: emergencyContact,
        notes: notes
      };

      const response = await api.post('/admin/operating-hours', data);

      if (response.data.success) {
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Jam operasional berhasil disimpan',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6',
          timer: 3000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
      } else {
        throw new Error(response.data.message || 'Gagal menyimpan jam operasional');
      }
    } catch (error) {
      console.error('Error saving operating hours:', error);

      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan!',
        text: 'Terjadi kesalahan: ' + error.message,
        confirmButtonText: 'Coba Lagi',
        confirmButtonColor: '#EF4444',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Jam Operasional</h2>
        <p className="text-gray-600">Atur jam operasional sekolah yang akan ditampilkan di halaman kontak</p>
      </div>

      {/* Operating Hours Table */}
      <Card padding="lg" className="shadow-lg border-0">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Jam Operasional</h3>
            <p className="text-gray-600">Atur jadwal operasional sekolah</p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden min-[900px]:block overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-calendar-alt text-gray-500"></i>
                    <span>Hari</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-info-circle text-gray-500"></i>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-gray-500"></i>
                    <span>Jam Buka</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-gray-500"></i>
                    <span>Jam Tutup</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-2">
                    <i className="fas fa-toggle-on text-gray-500"></i>
                    <span>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operatingHours.map((hour, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-calendar text-blue-600 text-sm"></i>
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className="text-base font-semibold text-gray-900">{hour.day}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      hour.is_open
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <i className={`fas ${hour.is_open ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                      {hour.is_open ? 'Buka' : 'Tutup'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {hour.is_open ? (
                      <div className="relative">
                        <input
                          type="time"
                          value={hour.start_time}
                          onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <i className="fas fa-clock text-gray-400"></i>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <i className="fas fa-minus mr-2"></i>
                        <span className="text-base">Tidak beroperasi</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {hour.is_open ? (
                      <div className="relative">
                        <input
                          type="time"
                          value={hour.end_time}
                          onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <i className="fas fa-clock text-gray-400"></i>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <i className="fas fa-minus mr-2"></i>
                        <span className="text-base">Tidak beroperasi</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleToggleDay(index)}
                        disabled={saving}
                        className={`relative inline-flex h-10 w-18 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 ${
                          hour.is_open
                            ? 'bg-gradient-to-r from-green-400 to-green-600 focus:ring-green-300 shadow-lg'
                            : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300 shadow-md'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
                      >
                        <span
                          className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
                            hour.is_open ? 'translate-x-9' : 'translate-x-1'
                          } ${hour.is_open ? 'shadow-xl' : 'shadow-md'}`}
                        >
                          <span className={`flex items-center justify-center h-full w-full transition-all duration-300 ${
                            hour.is_open ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <i className={`fas ${hour.is_open ? 'fa-check' : 'fa-times'} text-xs`}></i>
                          </span>
                        </span>
                        <span className="sr-only">
                          {hour.is_open ? 'Tutup' : 'Buka'} {hour.day}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="min-[900px]:hidden space-y-4">
          {operatingHours.map((hour, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-calendar text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{hour.day}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        hour.is_open
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <i className={`fas ${hour.is_open ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                        {hour.is_open ? 'Buka' : 'Tutup'}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Toggle */}
                  <button
                    onClick={() => handleToggleDay(index)}
                    disabled={saving}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      hour.is_open
                        ? 'bg-gradient-to-r from-green-400 to-green-600 focus:ring-green-300'
                        : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
                        hour.is_open ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    >
                      <span className={`flex items-center justify-center h-full w-full transition-all duration-300 ${
                        hour.is_open ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <i className={`fas ${hour.is_open ? 'fa-check' : 'fa-times'} text-xs`}></i>
                      </span>
                    </span>
                  </button>
                </div>

                {/* Time Inputs */}
                {hour.is_open ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-clock mr-2 text-blue-500"></i>
                        Jam Buka
                      </label>
                      <input
                        type="time"
                        value={hour.start_time}
                        onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-clock mr-2 text-red-500"></i>
                        Jam Tutup
                      </label>
                      <input
                        type="time"
                        value={hour.end_time}
                        onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center text-gray-400">
                      <i className="fas fa-moon mr-2"></i>
                      <span className="text-base">Tidak beroperasi</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Contact & Notes */}
      <Card padding="lg" className="shadow-lg border-0">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Informasi Tambahan</h3>
            <p className="text-gray-600">Kontak darurat dan catatan khusus</p>
          </div>
        </div>
          
          <div className="space-y-6">
            <Input
              label="Nomor Darurat"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="(021) 123-4569"
              helperText="Nomor yang dapat dihubungi di luar jam operasional"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Catatan tambahan untuk jam operasional"
              />
              <p className="mt-1 text-sm text-gray-500">
                Catatan yang akan ditampilkan di bawah jam operasional
              </p>
            </div>
          </div>
        </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg transition-all duration-200 ${
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Jam Operasional
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OperatingHoursSettings;
