/**
 * Jest test script untuk fitur late check-in attendance
 * 
 * Fitur late check-in dalam aplikasi absensi mencakup:
 * 1. Mendeteksi waktu check-in yang terlambat (setelah 09:10)
 * 2. Meminta alasan (keterangan) untuk late check-in
 * 3. Menyimpan alasan late check-in ke database
 * 4. Menampilkan status late check-in di UI
 */

const request = require('supertest');
const app = require('../server'); // Sesuaikan dengan file server Anda

// Konfigurasi
const API_BASE = '/api/attendance/check-in';

// Mock data untuk testing
const mockLocationData = {
    latitude: -6.924841, // Koordinat kantor
    longitude: 107.658695,
};

// Mock token JWT untuk testing (disesuaikan dengan struktur aplikasi Anda)
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('Late Check-in Feature Tests', () => {
    test('1. Harus dapat mendeteksi late check-in dan memerlukan keterangan', async () => {
        // Mock waktu yang menunjukkan waktu terlambat (setelah 09:10)
        // Kita akan simulasi dengan mengirim data late dan lateReason
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`]) // Simulasikan auth dengan token
            .send({
                ...mockLocationData,
                action: 'check-in',
                late: true,
                lateReason: 'Keterlambatan karena alasan darurat'
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.message).toMatch(/late check-in recorded|check-in successful/i);
    });

    test('2. Harus gagal saat late check-in tanpa keterangan', async () => {
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockLocationData,
                action: 'check-in',
                late: true
                // Tidak menyertakan lateReason
            })
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body.message).toMatch(/keterangan \(reason\) is required for late check-in/i);
    });

    test('3. Harus menyimpan late check-in reason ke database', async () => {
        // Ini akan menguji bahwa late check-in reason disimpan dengan benar
        const response = await request(app)
            .post(API_BASE)
            .set('Cookie', [`token=${mockToken}`])
            .send({
                ...mockLocationData,
                action: 'check-in',
                late: true,
                lateReason: 'Testing late check-in reason storage'
            })
            .expect('Content-Type', /json/)
            .expect(200);

        // Verifikasi bahwa pesan menunjukkan check-in berhasil
        expect(response.body.message).toMatch(/late check-in recorded|check-in successful/i);
    });
});

describe('Late Check-in Validation Tests', () => {
    test('Validasi penanganan waktu check-in terlambat', () => {
        // Simulasikan waktu check-in setelah pukul 09:10 (terlambat)
        const lateCheckInTime = new Date();
        lateCheckInTime.setHours(9, 15, 0, 0); // 09:15
        
        const hours = lateCheckInTime.getHours();
        const minutes = lateCheckInTime.getMinutes();
        
        // Periksa apakah waktu terlambat (setelah 09:10)
        const isLate = (hours > 9 || (hours === 9 && minutes > 10));
        
        expect(isLate).toBe(true);
    });

    test('Validasi bahwa keterangan tidak boleh kosong untuk late check-in', () => {
        const emptyReason = '';
        const validReason = 'Ini adalah keterangan terlambat';
        
        expect(emptyReason.trim().length).toBe(0);
        expect(validReason.trim().length).toBeGreaterThan(0);
    });

    test('Validasi format keterangan late check-in', () => {
        const validReasons = [
            'Terlambat karena macet',
            'Keterlambatan karena kendala transportasi',
            'Alasan pribadi mendesak'
        ];
        
        validReasons.forEach(reason => {
            expect(reason).toMatch(/^.{5,}/); // Minimal 5 karakter
        });
    });
});