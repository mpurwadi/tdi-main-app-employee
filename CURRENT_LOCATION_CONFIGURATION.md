# Konfigurasi Radius dan Lokasi Saat Ini

## 1. File .env
Sudah menggunakan variabel lingkungan:
```
OFFICE_LATITUDE=-6.9248406
OFFICE_LONGITUDE=107.6586951
GEOFENCE_RADIUS_METERS=400
```

## 2. File API
### app/api/attendance/check-in/route.ts
Sudah menggunakan variabel lingkungan:
```typescript
const OFFICE_LATITUDE = parseFloat(process.env.OFFICE_LATITUDE || '-6.924841');
const OFFICE_LONGITUDE = parseFloat(process.env.OFFICE_LONGITUDE || '107.658695');
const GEOFENCE_RADIUS_METERS = parseInt(process.env.GEOFENCE_RADIUS_METERS || '400');
```

### app/api/config/location/route.ts
Sudah menggunakan variabel lingkungan:
```typescript
const config = {
  officeLatitude: process.env.OFFICE_LATITUDE ? parseFloat(process.env.OFFICE_LATITUDE) : -6.924841,
  officeLongitude: process.env.OFFICE_LONGITUDE ? parseFloat(process.env.OFFICE_LONGITUDE) : 107.658695,
  geofenceRadiusMeters: process.env.GEOFENCE_RADIUS_METERS ? parseInt(process.env.GEOFENCE_RADIUS_METERS) : 400,
  // ... konfigurasi lainnya
};
```

## 3. File Frontend Components
### components/apps/absen/components-apps-absen.tsx
Masih menggunakan nilai hardcoded sebagai fallback:
```typescript
const [locationConfig, setLocationConfig] = useState({
    officeLatitude: -6.924841, // Default fallback
    officeLongitude: 107.658695, // Default fallback
    geofenceRadiusMeters: 400 // Default fallback
});
```

### components/user-dashboard/attendance-widget.tsx
Masih menggunakan nilai hardcoded sebagai fallback:
```typescript
const [locationConfig, setLocationConfig] = useState({
    officeLatitude: -6.200000, // Default fallback
    officeLongitude: 106.816666, // Default fallback
    geofenceRadiusMeters: 100 // Default fallback
});
```

## 4. File Test
Beberapa file test menggunakan nilai hardcoded:
- test-geofence-radius-verification.test.js
- test-late-checkin.test.js
- test-checkin-400m.test.js

## Kesimpulan
Sebagian besar file sudah menggunakan variabel lingkungan, tetapi beberapa komponen frontend masih menggunakan nilai hardcoded sebagai fallback. Perlu diubah agar semua konfigurasi sepenuhnya bergantung pada variabel lingkungan.