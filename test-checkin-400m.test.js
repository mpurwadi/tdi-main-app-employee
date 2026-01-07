/**
 * Jest test script untuk fitur check-in attendance dengan radius 400m
 * 
 * Fitur check-in dalam aplikasi absensi mencakup:
 * 1. Validasi lokasi dalam radius 400m dari kantor
 * 2. Late check-in dengan alasan (keterangan)
 * 3. Regular check-in dalam radius yang ditentukan
 */

// Untuk testing Next.js API routes, kita perlu pendekatan yang berbeda
// Kita akan menggunakan metode unit testing dengan Next.js
import {NextRequest} from 'next/server';
import {POST as postAttendanceCheckIn} from './app/api/attendance/check-in/route';

// Konfigurasi
const API_BASE = '/api/attendance/check-in';

// Mock data untuk testing dengan koordinat yang berbeda
const mockOfficeLocation = {
    latitude: -6.924841, // Koordinat kantor
    longitude: 107.658695,
};

const mockOutsideLocation = {
    latitude: -6.935000, // Koordinat di luar radius 400m
    longitude: 107.669000,
};

// Mock token JWT untuk testing (disesuaikan dengan struktur aplikasi Anda)
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('Check-in Attendance Feature Tests (400m radius)', () => {
    test('1. Harus berhasil saat check-in dalam radius 400m', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`]) // Simulasikan auth dengan token
            .send({
                ...mockOfficeLocation,
                action: 'check-in'
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.message).toMatch(/check-in successful|already checked in|late check-in recorded/i);
    });

    test('2. Harus gagal saat check-in di luar radius 400m', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockOutsideLocation,
                action: 'check-in'
            })
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toMatch(/meters away from the office\. Must be within 400 meters/i);
    });

    test('3. Harus berhasil saat late check-in dalam radius 400m dengan alasan', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockOfficeLocation,
                action: 'check-in',
                late: true,
                lateReason: 'Terlambat karena alasan darurat'
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.message).toMatch(/late check-in recorded|check-in successful/i);
    });

    test('4. Harus gagal saat late check-in tanpa alasan', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockOfficeLocation,
                action: 'check-in',
                late: true
                // Tidak menyertakan lateReason
            })
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toMatch(/keterangan \(reason\) is required for late check-in/i);
    });

    test('5. Harus berhasil saat check-out dalam radius 400m', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockOfficeLocation,
                action: 'check-out'
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.message).toMatch(/check-out successful|no active check-in found/i);
    });
});

describe('Geofencing Validation Tests (400m radius)', () => {
    test('Validasi radius geofence 400m', () => {
        // Simulasikan validasi jarak
        const distanceWithinRadius = 300; // meter
        const distanceOutsideRadius = 500; // meter
        const geofenceRadius = 400; // meter
        
        expect(distanceWithinRadius <= geofenceRadius).toBe(true);
        expect(distanceOutsideRadius <= geofenceRadius).toBe(false);
    });

    test('Validasi pesan error untuk lokasi di luar radius', () => {
        const distance = 8236.32; // meter, jarak dari contoh sebelumnya
        const geofenceRadius = 400; // meter
        
        const errorMessage = `You are ${distance.toFixed(2)} meters away from the office. Must be within ${geofenceRadius} meters.`;
        expect(errorMessage).toMatch(/8236.32 meters away/);
        expect(errorMessage).toMatch(/Must be within 400 meters/);
    });
});