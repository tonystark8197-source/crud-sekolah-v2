import { useState } from 'react';
import { Card, ToggleSwitch } from '../ui';

const ToggleSwitchDemo = () => {
  const [switches, setSwitches] = useState({
    basic: false,
    notifications: true,
    darkMode: false,
    autoSave: true,
    publicProfile: false,
    emailAlerts: true,
    smsAlerts: false,
    maintenance: false
  });

  const handleSwitchChange = (key, value) => {
    setSwitches(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toggle Switch Demo</h1>
        <p className="text-gray-600">Demonstrasi berbagai variasi komponen ToggleSwitch yang profesional</p>
      </div>

      {/* Basic Examples */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Toggle Switches</h2>
        <div className="space-y-4">
          <ToggleSwitch
            checked={switches.basic}
            onChange={(checked) => handleSwitchChange('basic', checked)}
            label="Basic Switch"
            description="Toggle switch dasar tanpa kustomisasi"
          />
          
          <ToggleSwitch
            id="notifications-toggle"
            checked={switches.notifications}
            onChange={(checked) => handleSwitchChange('notifications', checked)}
            label="Notifications"
            theme="light"
          />
          <p className="text-xs text-gray-500 ml-12">Aktifkan notifikasi push</p>
        </div>
      </Card>

      {/* Size Variations */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Size Variations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Small Size</h3>
            <ToggleSwitch
              checked={switches.darkMode}
              onChange={(checked) => handleSwitchChange('darkMode', checked)}
              size="sm"
              label="Dark Mode"
              description="Aktifkan tema gelap"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Medium Size (Default)</h3>
            <ToggleSwitch
              checked={switches.autoSave}
              onChange={(checked) => handleSwitchChange('autoSave', checked)}
              size="md"
              label="Auto Save"
              description="Simpan otomatis setiap 30 detik"
              activeColor="green"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Large Size</h3>
            <ToggleSwitch
              checked={switches.publicProfile}
              onChange={(checked) => handleSwitchChange('publicProfile', checked)}
              size="lg"
              label="Public Profile"
              description="Tampilkan profil secara publik"
              activeColor="blue"
              inactiveColor="gray"
            />
          </div>
        </div>
      </Card>

      {/* Color Variations */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Variations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleSwitch
            checked={switches.emailAlerts}
            onChange={(checked) => handleSwitchChange('emailAlerts', checked)}
            label="Email Alerts"
            description="Terima notifikasi via email"
            activeColor="green"
            inactiveColor="red"
          />
          
          <ToggleSwitch
            checked={switches.smsAlerts}
            onChange={(checked) => handleSwitchChange('smsAlerts', checked)}
            label="SMS Alerts"
            description="Terima notifikasi via SMS"
            activeColor="blue"
            inactiveColor="gray"
          />
        </div>
      </Card>

      {/* Special Cases */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Cases</h2>
        <div className="space-y-4">
          <ToggleSwitch
            checked={switches.maintenance}
            onChange={(checked) => handleSwitchChange('maintenance', checked)}
            label="Maintenance Mode"
            description="Aktifkan mode maintenance - website tidak dapat diakses"
            activeColor="red"
            inactiveColor="green"
            size="md"
          />
          
          <ToggleSwitch
            checked={false}
            onChange={() => {}}
            label="Disabled Switch"
            description="Toggle switch yang tidak dapat diubah"
            disabled={true}
          />
          
          <ToggleSwitch
            checked={true}
            onChange={() => {}}
            label="Disabled Active Switch"
            description="Toggle switch aktif yang tidak dapat diubah"
            disabled={true}
            activeColor="blue"
          />
        </div>
      </Card>

      {/* Without Labels */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Toggle Switches Without Labels</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Off</span>
            <ToggleSwitch
              checked={switches.basic}
              onChange={(checked) => handleSwitchChange('basic', checked)}
              size="sm"
            />
            <span className="text-sm text-gray-700">On</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Inactive</span>
            <ToggleSwitch
              checked={switches.notifications}
              onChange={(checked) => handleSwitchChange('notifications', checked)}
              activeColor="blue"
              inactiveColor="gray"
            />
            <span className="text-sm text-gray-700">Active</span>
          </div>
        </div>
      </Card>

      {/* Current State Display */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current State</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-700">
            {JSON.stringify(switches, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default ToggleSwitchDemo;
