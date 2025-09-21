
ini adalah tambahan fitur dari apliaksi exisiting yang dibuat. sehingga masih dalam 1 landing page dengan pilihan module aplikasi dan login yang sama.

dibuatkan roles baru yang dibutuhkan untuk user pengguna admin masing masih divisi. yang diatur daalam user managemen 

### **Nama Aplikasi:**
* **Internal Service Hub** (atau nama lain yang sesuai untuk perusahaan Anda).

### **Struktur Aplikasi & Modul**

Aplikasi ini akan memiliki tiga modul utama yang terintegrasi penuh:

1.  **Modul Inti (Aplikasi Eksisting):** Modul ini mencakup fitur-fitur yang sudah ada, seperti manajemen profil pengguna, absensi, dan halaman *landing page* atau *dashboard* utama.
2.  **Modul ITSM:** Modul baru yang akan kita bangun, berfokus pada manajemen layanan internal.
3.  **Modul Laporan & Analitik:** Modul ini akan menyajikan laporan dan wawasan dari data yang dikumpulkan dari modul Inti dan ITSM.

---

### **Deskripsi Modul ITSM & Proses Bisnis Terperinci**

#### **1. Modul: Katalog Layanan (Service Catalog)**

* **Tujuan:** Menjadi etalase digital yang menyediakan daftar semua layanan internal yang ditawarkan oleh divisi **DevOps, Big Data, Produk, dan Operasional**.
* **Proses Bisnis:**
    * **Pendaftaran Layanan:** Perwakilan setiap divisi penyedia akan menggunakan antarmuka khusus untuk mendaftarkan layanan baru. Mereka akan mengisi detail seperti nama layanan, deskripsi, kategori, dan informasi **biaya yang ditetapkan** (biaya tetap, per jam, atau per unit).
    * **Persetujuan Admin:** Setiap layanan yang didaftarkan akan masuk ke antrean persetujuan. **Admin Aplikasi** akan meninjau dan menyetujui layanan tersebut sebelum dipublikasikan ke katalog.
* **Peran Pengguna (User Roles):**
    * **Service Catalog Manager:** Peran ini bisa diemban oleh Admin Aplikasi atau perwakilan senior dari setiap divisi. Bertanggung jawab atas pengelolaan dan persetujuan layanan.
    * **Service Provider:** Anggota tim dari divisi penyedia yang mendaftarkan dan memperbarui detail layanan.

#### **2. Modul: Permintaan Layanan (Service Request)**

* **Tujuan:** Mengelola seluruh siklus hidup permintaan layanan dari awal hingga akhir, dari pengajuan hingga penyelesaian.
* **Proses Bisnis:**
    * **Pengajuan Permintaan:** Pengguna dari divisi peminta akan mengakses modul ini, menelusuri katalog layanan, dan memilih layanan yang dibutuhkan. Mereka akan mengisi formulir permintaan yang relevan.
    * **Alur Persetujuan:** Jika permintaan memiliki biaya di atas ambang batas yang ditetapkan, sistem akan secara otomatis mengirimkan notifikasi persetujuan kepada manajer atau koordinator keuangan divisi peminta.
    * **Pengerjaan & Penyelesaian:** Setelah disetujui, permintaan akan menjadi tiket yang diteruskan ke tim penyedia. Tim ini bertanggung jawab untuk melacak, mengerjakan, dan menandai tiket sebagai "Selesai".
    * **Pencatatan Biaya Otomatis:** Ketika tiket ditandai "Selesai", sistem secara otomatis mencatat transaksi biaya antara divisi peminta dan penyedia. Data ini akan menjadi basis untuk penagihan bulanan.
* **Peran Pengguna (User Roles):**
    * **Service Requester:** Semua pengguna di seluruh divisi. Mereka mengajukan permintaan, melacak status, dan berkomunikasi dengan tim penyedia melalui tiket.
    * **Approver:** Manajer yang memiliki wewenang untuk menyetujui permintaan yang berbiaya.
    * **Service Provider:** Tim atau individu di divisi penyedia yang mengerjakan dan menyelesaikan permintaan.

#### **3. Modul: Penagihan & Laporan Internal (Internal Billing & Reporting)**

* **Tujuan:** Mengotomatisasi proses penagihan antar-divisi dan menyediakan wawasan data yang berharga.
* **Proses Bisnis:**
    * **Generasi Invoice:** Pada tanggal yang telah ditentukan, sistem secara otomatis menghasilkan invoice internal untuk setiap divisi, merinci semua layanan yang mereka gunakan dan biaya total. Invoice ini akan dikirimkan secara otomatis ke pihak yang berwenang.
    * **Konfirmasi Pembayaran:** Pihak yang bertanggung jawab di divisi peminta dapat mengonfirmasi pembayaran di dalam aplikasi. Mereka juga bisa mengunggah bukti pembayaran sebagai dokumentasi.
    * **Pelaporan:** Sistem akan menyajikan dasbor dan laporan yang menampilkan total pengeluaran per divisi, pendapatan yang dihasilkan oleh setiap divisi, dan layanan yang paling sering digunakan.
* **Peran Pengguna (User Roles):**
    * **Billing Coordinator:** Koordinator keuangan di setiap divisi. Mereka bertanggung jawab untuk meninjau invoice, mengonfirmasi pembayaran, dan menyelesaikan perselisihan.
    * **Admin/Eksekutif:** Memiliki akses penuh ke dasbor dan laporan analitik untuk memantau efisiensi operasional dan alokasi anggaran antar-divisi.

### **Integrasi dengan Aplikasi Eksisting**

* **Pengguna Terpusat (Unified User):** Fitur ITSM akan terintegrasi dengan sistem otentikasi aplikasi eksisting Anda, sehingga pengguna hanya perlu satu kali masuk (*single sign-on*) untuk mengakses semua fitur.
* **Dasbor Utama:** Anda dapat menambahkan widget atau tautan cepat di halaman utama aplikasi yang sudah ada untuk memudahkan akses ke modul ITSM.
* **Data & Log:** Semua data dari modul ITSM, termasuk riwayat tiket dan transaksi, akan disimpan bersama data pengguna dan absensi, memungkinkan analisis yang lebih komprehensif.

### **4. Modul: Manajemen Perubahan (Change Management)**

* **Tujuan:** Mengelola semua perubahan pada aplikasi atau infrastruktur TI di kantor Anda secara sistematis. Tujuannya adalah untuk meminimalkan risiko gangguan layanan, memastikan perubahan sesuai dengan kebutuhan bisnis, dan mendokumentasikan setiap proses.

* **Fitur Utama:**
    * **Pengajuan Permintaan Perubahan (Change Request):** Antarmuka yang memungkinkan tim teknis (terutama dari divisi **DevOps** dan **Produk**) untuk mengajukan dan mendeskripsikan perubahan yang akan mereka lakukan. Formulir ini akan mencakup detail seperti alasan perubahan, dampak potensial, rencana *rollback* (kembali ke versi sebelumnya), dan jadwal yang diusulkan.
    * **Alur Persetujuan (Approval Workflow):** Permintaan perubahan akan melalui proses persetujuan. Perubahan kecil mungkin disetujui secara otomatis, sementara perubahan besar atau berisiko tinggi akan memerlukan persetujuan dari **Change Advisory Board (CAB)**.
    * **Kalender Perubahan:** Fitur visual yang menampilkan semua perubahan yang disetujui dan direncanakan. Ini membantu tim IT dan manajemen untuk melihat potensi konflik jadwal.
    * **Pelacakan Status:** Setiap permintaan perubahan memiliki status yang dapat dilacak (*Submitted, Approved, Scheduled, In Progress, Completed, Failed*).
    * **Otomasi & Integrasi:** Modul ini dapat diintegrasikan dengan modul **Service Request** (misalnya, jika perubahan dipicu oleh permintaan dari pengguna) dan juga dapat dihubungkan dengan *tools* lain yang digunakan oleh tim DevOps atau Produk.

* **Proses Bisnis:**
    * **Pengajuan:** Tim yang bertanggung jawab (misalnya, tim pengembang) mengajukan *Change Request* melalui aplikasi.
    * **Peninjauan:** Permintaan akan masuk ke tim **Change Manager** yang akan meninjau kelengkapan informasi.
    * **Persetujuan:** Permintaan disajikan kepada **CAB** atau pihak yang berwenang untuk disetujui atau ditolak berdasarkan risiko dan manfaatnya.
    * **Implementasi:** Setelah disetujui, perubahan diimplementasikan sesuai jadwal. Status tiket diperbarui.
    * **Peninjauan Pasca-Implementasi:** Setelah perubahan selesai, tim dapat melakukan peninjauan untuk memastikan perubahan berjalan sukses dan tidak ada efek samping yang tidak diinginkan.

* **Peran Pengguna (User Roles):**
    * **Change Requester:** Tim teknis, terutama dari **DevOps** dan **Produk**, yang mengajukan perubahan.
    * **Change Manager:** Individu yang bertanggung jawab untuk mengelola proses perubahan, memastikan semua prosedur diikuti, dan menjadwalkan pertemuan CAB.
    * **Change Advisory Board (CAB):** Kelompok dari berbagai divisi (IT, operasional, bahkan perwakilan bisnis) yang meninjau dan menyetujui perubahan besar.
    * **Implementer:** Tim yang bertugas melaksanakan perubahan teknis yang sudah disetujui.

Dengan penambahan modul ini, aplikasi Anda akan menjadi platform ITSM yang jauh lebih lengkap, mencakup pengelolaan permintaan rutin hingga perubahan strategis pada sistem.
