
# Panduan Testing Aplikasi Manajemen Karyawan TDI

Dokumen ini berisi langkah-langkah untuk menguji alur kerja pendaftaran pengguna, persetujuan oleh admin, dan proses login.

## Prasyarat

1.  Pastikan aplikasi sedang berjalan (jalankan `npm run dev`).
2.  Pastikan database PostgreSQL sudah terkonfigurasi dan super admin (`admin@tdi.com` dengan password `AdminPassword123!`) sudah ada sesuai `gemini.md`.

---

## Skenario Pengujian

Ikuti skenario ini secara berurutan untuk memvalidasi seluruh alur.

### Test Case 1: Pendaftaran Pengguna Baru

Tujuan: Memastikan pengguna baru dapat mendaftar dan statusnya otomatis `pending`.

1.  Buka browser dan navigasi ke halaman pendaftaran: [http://localhost:3000/auth/boxed-signup](http://localhost:3000/auth/boxed-signup).
2.  Isi formulir dengan data pengguna baru. Contoh:
    -   **Full Name**: `Test User`
    -   **Email**: `testuser@example.com`
    -   **Password**: `Password123`
    -   **Password Confirmation**: `Password123`
    -   **Student ID**: `12345678`
    -   **Campus**: `TDI University`
    -   **Division**: `QA`
3.  Klik tombol **"Sign Up"**.
4.  **Hasil yang Diharapkan**: Anda akan melihat notifikasi `alert` bertuliskan "Registration successful! Please wait for admin approval." dan kemudian diarahkan ke halaman login.

### Test Case 2: Gagal Login dengan Akun `pending`

Tujuan: Memastikan pengguna dengan status `pending` tidak bisa login.

1.  Anda sekarang seharusnya berada di halaman login: [http://localhost:3000/auth/boxed-signin](http://localhost:3000/auth/boxed-signin).
2.  Coba login menggunakan akun yang baru saja Anda daftarkan (`testuser@example.com` dan password `Password123`).
3.  **Hasil yang Diharapkan**: Proses login gagal dan sebuah pesan error akan muncul di bawah formulir: "Your account is pending approval from an administrator."

### Test Case 3: Persetujuan Pengguna oleh Admin

Tujuan: Memastikan admin dapat melihat dan menyetujui pengguna baru.

1.  Di halaman login, masuk sebagai admin:
    -   **Email**: `admin@tdi.com`
    -   **Password**: `AdminPassword123!`
2.  Setelah berhasil login, navigasi ke halaman persetujuan admin: [http://localhost:3000/admin/approval](http://localhost:3000/admin/approval).
3.  **Hasil yang Diharapkan**: Anda akan melihat tabel berisi data `Test User` yang baru saja mendaftar.
4.  Cari baris untuk `testuser@example.com` dan klik tombol **"Approve"**.
5.  **Hasil yang Diharapkan**: Baris pengguna tersebut akan hilang dari tabel.

### Test Case 4: Berhasil Login dengan Akun yang Disetujui

Tujuan: Memastikan pengguna yang sudah disetujui dapat login.

1.  Logout dari akun admin (saat ini belum ada tombol logout fungsional, jadi Anda bisa menggunakan browser mode Incognito atau membersihkan cookie untuk sesi admin).
2.  Kembali ke halaman login: [http://localhost:3000/auth/boxed-signin](http://localhost:3000/auth/boxed-signin).
3.  Login kembali menggunakan akun `testuser@example.com`.
4.  **Hasil yang Diharapkan**: Login berhasil, dan Anda akan diarahkan ke halaman utama aplikasi (`/`).

---

Jika semua skenario di atas berhasil, maka alur kerja manajemen pengguna berfungsi dengan benar.
