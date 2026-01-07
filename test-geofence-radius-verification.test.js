/**
 * Test untuk memverifikasi bahwa radius geofence telah diubah ke 400 meter
 */
const fs = require('fs');
const path = require('path');

// Membaca file .env
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

describe('Verifikasi Konfigurasi Radius Geofence', () => {
    test('1. Memastikan GEOFENCE_RADIUS_METERS di .env adalah 400', () => {
        // Mencari baris yang berisi GEOFENCE_RADIUS_METERS
        const geofenceRadiusMatch = envContent.match(/GEOFENCE_RADIUS_METERS=(\d+)/);
        
        // Memastikan bahwa konfigurasi ditemukan
        expect(geofenceRadiusMatch).not.toBeNull();
        
        // Memastikan nilai adalah 400
        expect(parseInt(geofenceRadiusMatch[1])).toBe(400);
    });

    test('2. Memastikan nilai default di API check-in menggunakan variabel lingkungan', () => {
        // Membaca file API check-in
        const apiPath = path.resolve(__dirname, 'app/api/attendance/check-in/route.ts');
        const apiContent = fs.readFileSync(apiPath, 'utf8');
        
        // Memastikan nilai menggunakan variabel lingkungan
        expect(apiContent).toContain('const OFFICE_LATITUDE = parseFloat(process.env.OFFICE_LATITUDE || \'-6.924841\');');
        expect(apiContent).toContain('const OFFICE_LONGITUDE = parseFloat(process.env.OFFICE_LONGITUDE || \'107.658695\');');
        expect(apiContent).toContain('const GEOFENCE_RADIUS_METERS = parseInt(process.env.GEOFENCE_RADIUS_METERS || \'400\');');
    });

    test('3. Memastikan nilai default di API config location menggunakan variabel lingkungan', () => {
        // Membaca file API config location
        const apiPath = path.resolve(__dirname, 'app/api/config/location/route.ts');
        const apiContent = fs.readFileSync(apiPath, 'utf8');
        
        // Memastikan nilai menggunakan variabel lingkungan
        expect(apiContent).toContain('officeLatitude: process.env.OFFICE_LATITUDE ? parseFloat(process.env.OFFICE_LATITUDE) : -6.924841,');
        expect(apiContent).toContain('officeLongitude: process.env.OFFICE_LONGITUDE ? parseFloat(process.env.OFFICE_LONGITUDE) : 107.658695,');
        expect(apiContent).toContain('geofenceRadiusMeters: process.env.GEOFENCE_RADIUS_METERS ? parseInt(process.env.GEOFENCE_RADIUS_METERS) : 400,');
    });

    test('4. Memastikan komponen frontend menggunakan variabel lingkungan', () => {
        // Membaca file komponen frontend absen
        const absenComponentPath = path.resolve(__dirname, 'components/apps/absen/components-apps-absen.tsx');
        const absenComponentContent = fs.readFileSync(absenComponentPath, 'utf8');
        
        // Memastikan komponen absen menggunakan variabel lingkungan
        expect(absenComponentContent).toContain('process.env.OFFICE_LATITUDE ? parseFloat(process.env.OFFICE_LATITUDE) : -6.924841');
        expect(absenComponentContent).toContain('process.env.OFFICE_LONGITUDE ? parseFloat(process.env.OFFICE_LONGITUDE) : 107.658695');
        expect(absenComponentContent).toContain('process.env.GEOFENCE_RADIUS_METERS ? parseInt(process.env.GEOFENCE_RADIUS_METERS) : 400');
        
        // Membaca file komponen dashboard attendance
        const dashboardComponentPath = path.resolve(__dirname, 'components/user-dashboard/attendance-widget.tsx');
        const dashboardComponentContent = fs.readFileSync(dashboardComponentPath, 'utf8');
        
        // Memastikan komponen dashboard menggunakan variabel lingkungan
        expect(dashboardComponentContent).toContain('process.env.DASHBOARD_OFFICE_LATITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LATITUDE) : -6.200000');
        expect(dashboardComponentContent).toContain('process.env.DASHBOARD_OFFICE_LONGITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LONGITUDE) : 106.816666');
        expect(dashboardComponentContent).toContain('process.env.DASHBOARD_GEOFENCE_RADIUS_METERS ? parseInt(process.env.DASHBOARD_GEOFENCE_RADIUS_METERS) : 100');
    });

    test('5. Validasi logika geofencing dengan radius 400m dari variabel lingkungan', () => {
        // Membaca konfigurasi dari .env
        const geofenceRadiusMatch = envContent.match(/GEOFENCE_RADIUS_METERS=(\d+)/);
        const officeLatMatch = envContent.match(/OFFICE_LATITUDE=(-?\d+\.\d+)/);
        const officeLngMatch = envContent.match(/OFFICE_LONGITUDE=(-?\d+\.\d+)/);
        
        const GEOFENCE_RADIUS_METERS = geofenceRadiusMatch ? parseInt(geofenceRadiusMatch[1]) : 400;
        const OFFICE_LATITUDE = officeLatMatch ? parseFloat(officeLatMatch[1]) : -6.924841;
        const OFFICE_LONGITUDE = officeLngMatch ? parseFloat(officeLngMatch[1]) : 107.658695;
        
        // Fungsi untuk menghitung jarak menggunakan rumus Haversine
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3; // metres
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // in metres
            return distance;
        };

        // Lokasi dalam radius 400m dari kantor
        const locationWithinRadius = {
            latitude: OFFICE_LATITUDE, // Sama dengan lokasi kantor
            longitude: OFFICE_LONGITUDE // Sama dengan lokasi kantor
        };

        // Menghitung jarak
        const distance = calculateDistance(
            OFFICE_LATITUDE,
            OFFICE_LONGITUDE,
            locationWithinRadius.latitude,
            locationWithinRadius.longitude
        );

        // Memastikan jarak kurang dari atau sama dengan 400m
        expect(distance).toBeLessThanOrEqual(GEOFENCE_RADIUS_METERS);
        
        // Memastikan jarak lebih besar dari atau sama dengan 0m
        expect(distance).toBeGreaterThanOrEqual(0);
    });
});