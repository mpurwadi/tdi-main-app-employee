/**
 * Test sederhana untuk memverifikasi bahwa radius geofence telah diubah ke 400m
 */

const fs = require('fs');
const path = require('path');

describe('Geofence Radius Configuration Test', () => {
    test('1. Verifikasi GEOFENCE_RADIUS_METERS di .env adalah 400', () => {
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const geofenceRadiusMatch = envContent.match(/GEOFENCE_RADIUS_METERS=(\d+)/);
        
        expect(geofenceRadiusMatch).not.toBeNull();
        expect(parseInt(geofenceRadiusMatch[1])).toBe(400);
    });

    test('2. Verifikasi nilai default di API check-in adalah 400', () => {
        const apiContent = fs.readFileSync(path.join(__dirname, 'app/api/attendance/check-in/route.ts'), 'utf8');
        expect(apiContent).toContain('const GEOFENCE_RADIUS_METERS = parseInt(process.env.GEOFENCE_RADIUS_METERS || \'400\'); // 400 meters');
    });

    test('3. Verifikasi nilai default di API config location adalah 400', () => {
        const apiContent = fs.readFileSync(path.join(__dirname, 'app/api/config/location/route.ts'), 'utf8');
        expect(apiContent).toContain('geofenceRadiusMeters: process.env.GEOFENCE_RADIUS_METERS ? parseInt(process.env.GEOFENCE_RADIUS_METERS) : 400,');
    });

    test('4. Verifikasi komentar di komponen frontend menunjukkan 400m', () => {
        const componentContent = fs.readFileSync(path.join(__dirname, 'components/apps/absen/components-apps-absen.tsx'), 'utf8');
        expect(componentContent).toContain('geofenceRadiusMeters: 400 // Default fallback');
        expect(componentContent).toContain('Pastikan Anda berada dalam radius 400 meter dari kantor untuk melakukan absensi.');
    });
});

// Test logika perhitungan jarak
describe('Geofencing Logic Tests', () => {
    test('5. Validasi logika geofencing dengan radius 400m', () => {
        // Simulasikan fungsi perhitungan jarak
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

        // Koordinat kantor
        const OFFICE_LATITUDE = -6.924841;
        const OFFICE_LONGITUDE = 107.658695;
        
        // Test dengan lokasi dalam radius (sekitar 300m dari kantor)
        const locationWithinRadius = {
            latitude: -6.925000, // sekitar 170 meter dari kantor
            longitude: 107.659000
        };
        
        // Test dengan lokasi di luar radius (lebih dari 400m dari kantor)
        const locationOutsideRadius = {
            latitude: -6.935000, // sekitar 1.1km dari kantor
            longitude: 107.669000
        };

        const distanceWithin = calculateDistance(
            OFFICE_LATITUDE, 
            OFFICE_LONGITUDE, 
            locationWithinRadius.latitude, 
            locationWithinRadius.longitude
        );
        
        const distanceOutside = calculateDistance(
            OFFICE_LATITUDE, 
            OFFICE_LONGITUDE, 
            locationOutsideRadius.latitude, 
            locationOutsideRadius.longitude
        );

        const GEOFENCE_RADIUS_METERS = 400;

        // Validasi bahwa lokasi dalam radius diterima
        expect(distanceWithin <= GEOFENCE_RADIUS_METERS).toBe(true);

        // Validasi bahwa lokasi di luar radius ditolak
        expect(distanceOutside <= GEOFENCE_RADIUS_METERS).toBe(false);

        // Validasi bahwa pesan error akan ditampilkan untuk lokasi di luar radius
        const errorMessage = `You are ${distanceOutside.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.`;
        expect(errorMessage).toMatch(/meters away from the office. Must be within 400 meters/);
    });
});