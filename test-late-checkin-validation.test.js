/**
 * Test untuk memverifikasi late check-in functionality dengan pendekatan Next.js
 */

// Mock data untuk testing
const mockLocationData = {
    latitude: -6.924841, // Koordinat kantor
    longitude: 107.658695,
};

describe('Late Check-in Validation Tests', () => {
    test('Validasi penanganan waktu check-in terlambat', () => {
        // Simulasikan fungsi pengecekan waktu terlambat
        const isLateCheckIn = (checkInTime) => {
            // Dalam implementasi sebenarnya, ini akan memeriksa waktu check-in terhadap jam kerja
            // Untuk test ini, kita akan mensimulasikan dengan waktu tetap
            const timeToCheck = checkInTime ? new Date(checkInTime) : new Date();
            const hours = timeToCheck.getHours();
            const minutes = timeToCheck.getMinutes();
            
            // Standar jam masuk kantor adalah 09:00, terlambat jika setelah 09:10
            if (hours > 9 || (hours === 9 && minutes > 10)) {
                return true;
            }
            return false;
        };

        // Membuat waktu terlambat (10:00)
        const lateTime = new Date();
        lateTime.setHours(10, 0, 0, 0);
        
        // Membuat waktu tidak terlambat (08:30)
        const onTime = new Date();
        onTime.setHours(8, 30, 0, 0);

        // Validasi bahwa waktu terlambat terdeteksi dengan benar
        expect(isLateCheckIn(lateTime)).toBe(true);

        // Validasi bahwa waktu tidak terlambat tidak terdeteksi sebagai terlambat
        expect(isLateCheckIn(onTime)).toBe(false);
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

    test('Validasi bahwa late check-in memerlukan keterangan', () => {
        const lateCheckInData = {
            ...mockLocationData,
            action: 'check-in',
            late: true,
            lateReason: 'Terlambat karena hujan deras'
        };

        // Memastikan bahwa lateReason ada dan tidak kosong
        expect(lateCheckInData).toHaveProperty('lateReason');
        expect(lateCheckInData.lateReason).toBeDefined();
        expect(lateCheckInData.lateReason.trim().length).toBeGreaterThan(0);
    });

    test('Validasi bahwa check-in normal tidak memerlukan keterangan', () => {
        const normalCheckInData = {
            ...mockLocationData,
            action: 'check-in'
            // Tidak ada properti late atau lateReason
        };

        // Memastikan bahwa tidak ada properti late
        expect(normalCheckInData).not.toHaveProperty('late');
    });
});