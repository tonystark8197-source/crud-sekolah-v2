# ToggleSwitch Component

Komponen ToggleSwitch yang profesional dan dapat dikustomisasi untuk aplikasi React.

## Features

- ✅ **Smooth Animation**: Animasi transisi yang halus dengan durasi 300ms
- ✅ **Multiple Sizes**: Tersedia dalam 3 ukuran (sm, md, lg)
- ✅ **Color Customization**: Warna dapat dikustomisasi untuk state aktif dan nonaktif
- ✅ **Accessibility**: Mendukung keyboard navigation dan screen readers
- ✅ **Professional Design**: Gradient background, shadow effects, dan indicator dots
- ✅ **Flexible**: Dapat digunakan dengan atau tanpa label dan deskripsi
- ✅ **Disabled State**: Mendukung state disabled dengan visual feedback

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Status toggle switch (aktif/nonaktif) |
| `onChange` | `function` | - | Callback function yang dipanggil saat toggle berubah |
| `disabled` | `boolean` | `false` | Menonaktifkan toggle switch |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ukuran toggle switch |
| `activeColor` | `'green' \| 'blue' \| 'red' \| 'gray'` | `'green'` | Warna saat toggle aktif |
| `inactiveColor` | `'green' \| 'blue' \| 'red' \| 'gray'` | `'red'` | Warna saat toggle nonaktif |
| `label` | `string` | - | Label yang ditampilkan di samping toggle |
| `description` | `string` | - | Deskripsi yang ditampilkan di bawah label |
| `className` | `string` | `''` | CSS class tambahan |

## Usage Examples

### Basic Usage

```jsx
import { ToggleSwitch } from '../ui';

const [isActive, setIsActive] = useState(false);

<ToggleSwitch
  checked={isActive}
  onChange={setIsActive}
/>
```

### With Label and Description

```jsx
<ToggleSwitch
  checked={notifications}
  onChange={setNotifications}
  label="Push Notifications"
  description="Receive notifications on your device"
/>
```

### Different Sizes

```jsx
{/* Small */}
<ToggleSwitch
  checked={darkMode}
  onChange={setDarkMode}
  size="sm"
  label="Dark Mode"
/>

{/* Medium (Default) */}
<ToggleSwitch
  checked={autoSave}
  onChange={setAutoSave}
  size="md"
  label="Auto Save"
/>

{/* Large */}
<ToggleSwitch
  checked={publicProfile}
  onChange={setPublicProfile}
  size="lg"
  label="Public Profile"
/>
```

### Custom Colors

```jsx
{/* Blue active, gray inactive */}
<ToggleSwitch
  checked={emailAlerts}
  onChange={setEmailAlerts}
  activeColor="blue"
  inactiveColor="gray"
  label="Email Alerts"
/>

{/* Red active (for dangerous actions) */}
<ToggleSwitch
  checked={maintenanceMode}
  onChange={setMaintenanceMode}
  activeColor="red"
  inactiveColor="green"
  label="Maintenance Mode"
/>
```

### Disabled State

```jsx
<ToggleSwitch
  checked={true}
  onChange={() => {}}
  disabled={true}
  label="Read Only Setting"
  description="This setting cannot be changed"
/>
```

## Color Options

### Available Colors
- **green**: Default untuk state aktif
- **blue**: Untuk informational toggles
- **red**: Untuk warning/dangerous actions
- **gray**: Untuk neutral states

### Color Combinations
- `activeColor="green"` + `inactiveColor="red"` - Default (Aktif/Nonaktif)
- `activeColor="blue"` + `inactiveColor="gray"` - Information (On/Off)
- `activeColor="red"` + `inactiveColor="green"` - Warning (Dangerous/Safe)

## Size Specifications

| Size | Container | Thumb | Use Case |
|------|-----------|-------|----------|
| `sm` | 36×20px | 12×12px | Compact forms, table rows |
| `md` | 48×28px | 20×20px | Standard forms, settings |
| `lg` | 56×32px | 24×24px | Prominent settings, headers |

## Accessibility

- **Keyboard Support**: Space dan Enter untuk toggle
- **ARIA Attributes**: `role="switch"` dan `aria-checked`
- **Focus Management**: Visual focus indicator
- **Screen Reader**: Label dan description dibaca dengan benar

## Animation Details

- **Duration**: 300ms untuk semua transisi
- **Easing**: `ease-in-out` untuk gerakan yang natural
- **Elements**: Thumb position, background color, indicator dots
- **Shadow**: Dynamic shadow berdasarkan state

## Best Practices

1. **Default State**: Gunakan `false` sebagai default untuk data baru
2. **Color Choice**: Pilih warna yang sesuai dengan konteks
3. **Label**: Selalu berikan label yang jelas
4. **Feedback**: Berikan deskripsi untuk menjelaskan efek toggle
5. **Consistency**: Gunakan ukuran yang konsisten dalam satu interface

## Implementation in Forms

```jsx
// In form data
const [formData, setFormData] = useState({
  is_active: false, // Default nonaktif
  // ... other fields
});

// In form component
<ToggleSwitch
  checked={formData.is_active}
  onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
  label={formData.is_active ? 'Aktif' : 'Nonaktif'}
  description={formData.is_active ? 'Tampilkan di website' : 'Sembunyikan dari website'}
  disabled={isSubmitting}
/>
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Performance

- Menggunakan CSS transforms untuk animasi yang smooth
- Minimal re-renders dengan proper prop handling
- Optimized untuk mobile touch interactions
