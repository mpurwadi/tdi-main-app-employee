# File yang menggunakan pengaturan radius dan lokasi

## File .env
- OFFICE_LATITUDE
- OFFICE_LONGITUDE
- GEOFENCE_RADIUS_METERS

## File API:
1. app/api/attendance/check-in/route.ts
2. app/api/config/location/route.ts

## File Frontend Components:
1. components/apps/absen/components-apps-absen.tsx
2. components/user-dashboard/attendance-widget.tsx

## File Test:
1. test-geofence-radius-verification.test.js
2. test-late-checkin.test.js
3. test-checkin-400m.test.js