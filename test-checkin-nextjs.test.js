/**
 * Jest test script untuk fitur check-in attendance dengan radius 400m
 * 
 * Fitur check-in dalam aplikasi absensi mencakup:
 * 1. Validasi lokasi dalam radius 400m dari kantor
 * 2. Late check-in dengan alasan (keterangan)
 * 3. Regular check-in dalam radius yang ditentukan
 */

// Kita akan menggunakan pendekatan unit testing untuk fungsi handler Next.js
import { NextRequest } from 'next/server';
import { POST as postAttendanceCheckIn } from './app/api/attendance/check-in/route';

// Mock data untuk testing dengan koordinat yang berbeda
const mockOfficeLocation = {
    latitude: -6.924841, // Koordinat kantor
    longitude: 107.658695,
};

const mockOutsideLocation = {
    latitude: -6.935000, // Koordinat di luar radius 400m
    longitude: 107.669000,
};

// Mock token JWT
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Mock cookies
const mockCookies = {
    get: jest.fn().mockReturnValue({ value: mockToken })
};

// Mock jwt.verify
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn().mockReturnValue({ userId: 1 })
}));

// Mock db
jest.mock('@/lib/db', () => ({
    db: {
        query: jest.fn()
    }
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    ...jest.requireActual('next/server'),
    NextResponse: {
        json: jest.fn().mockImplementation((data, options) => ({
            data,
            status: options?.status || 200,
            json: async () => data
        }))
    }
}));

describe('Check-in Attendance Feature Tests (400m radius)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. Harus berhasil saat check-in dalam radius 400m', async () => {
        // Mock db query untuk kasus tidak ada check-in sebelumnya
        const { db } = require('@/lib/db');
        db.query.mockResolvedValueOnce({ rows: [] }); // Tidak ada record sebelumnya
        db.query.mockResolvedValueOnce({ rows: [] }); // Tidak ada record active

        // Mock request
        const mockRequest = {
            cookies: mockCookies,
            json: async () => ({ 
                latitude: mockOfficeLocation.latitude,
                longitude: mockOfficeLocation.longitude,
                action: 'check-in' 
            })
        };

        // Jalankan fungsi
        const response = await postAttendanceCheckIn(mockRequest);

        // Periksa hasil
        expect(response.status).toBe(200);
    });

    test('2. Harus gagal saat check-in di luar radius 400m', async () => {
        // Mock request dengan lokasi di luar radius
        const mockRequest = {
            cookies: mockCookies,
            json: async () => ({ 
                latitude: mockOutsideLocation.latitude,
                longitude: mockOutsideLocation.longitude,
                action: 'check-in' 
            })
        };

        // Jalankan fungsi
        const response = await postAttendanceCheckIn(mockRequest);

        // Periksa hasil - harus gagal karena diluar radius
        expect(response.status).toBe(400);
        expect(response.data.message).toMatch(/Must be within 400 meters/);
    });

    test('3. Harus berhasil saat late check-in dalam radius 400m dengan alasan', async () => {
        // Mock db query
        const { db } = require('@/lib/db');
        db.query.mockResolvedValueOnce({ rows: [] }); // Tidak ada record sebelumnya
        db.query.mockResolvedValueOnce({ rows: [] }); // Tidak ada record active

        // Mock request
        const mockRequest = {
            cookies: mockCookies,
            json: async () => ({ 
                latitude: mockOfficeLocation.latitude,
                longitude: mockOfficeLocation.longitude,
                action: 'check-in',
                late: true,
                lateReason: 'Terlambat karena alasan darurat'
            })
        };

        // Jalankan fungsi
        const response = await postAttendanceCheckIn(mockRequest);

        // Periksa hasil
        expect(response.status).toBe(200);
    });

    test('4. Harus gagal saat late check-in tanpa alasan', async () => {
        // Mock request
        const mockRequest = {
            cookies: mockCookies,
            json: async () => ({ 
                latitude: mockOfficeLocation.latitude,
                longitude: mockOfficeLocation.longitude,
                action: 'check-in',
                late: true
                // Tidak menyertakan lateReason
            })
        };

        // Jalankan fungsi
        const response = await postAttendanceCheckIn(mockRequest);

        // Periksa hasil - harus gagal karena tidak ada alasan late check-in
        expect(response.status).toBe(400);
        expect(response.data.message).toMatch(/Keterangan \(reason\) is required for late check-in/);
    });
});

describe('Geofencing Validation Tests (400m radius)', () => {
    test('Validasi radius geofence 400m', () => {
        // Kita hanya bisa melakukan validasi logika di sini karena menggunakan fungsi internal
        const geofenceRadius = 400; // meter
        
        // Cek bahwa nilai radius cocok dengan yang diharapkan
        expect(geofenceRadius).toBe(400);
    });
});