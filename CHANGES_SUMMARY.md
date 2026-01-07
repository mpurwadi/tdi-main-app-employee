## Perubahan Radius Geofence dari 50km ke 400m

### File yang Diubah:
1. `.env` - Mengubah `GEOFENCE_RADIUS_METERS` dari 50000 menjadi 400
2. `app/api/attendance/check-in/route.ts` - Memperbarui komentar dari 50000 ke 400 meter
3. `app/api/config/location/route.ts` - Memperbarui nilai default dari 50000 ke 400
4. `components/apps/absen/components-apps-absen.tsx` - Memperbarui nilai default dan komentar di UI

### Test yang Dijalankan:
- `test-geofence-radius.test.js` - Berhasil mengonfirmasi semua perubahan konfigurasi
- Test mencakup validasi konfigurasi dan logika geofencing

### Hasil:
- Radius geofence berhasil diubah dari 50km (50000m) ke 400m
- Aplikasi sekarang akan memerlukan pengguna berada dalam radius 400m dari kantor untuk check-in
- Pesan error akan menunjukkan batas 400m bukan 50km

### Catatan:
- Aplikasi perlu di-restart agar perubahan variabel lingkungan diterapkan
- Cache browser mungkin perlu di-clear untuk melihat perubahan UI