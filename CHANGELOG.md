# Catatan Perubahan

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini.

Format ini berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Belum Dirilis]

## [1.3.0] - 2025-06-14

### Ditambahkan
- File .env.example untuk memudahkan konfigurasi environment
- Contoh kode PHP lengkap di folder example/ untuk integrasi payment gateway
- Dokumentasi yang lebih komprehensif untuk setup dan konfigurasi

### Diubah
- Perbaikan link dokumentasi di README.md
- Peningkatan struktur dokumentasi untuk kemudahan penggunaan
- README.md disederhanakan dan dibuat full bahasa Indonesia

### Diperbaiki
- Perbaikan link yang rusak dalam dokumentasi
- Sinkronisasi antara dokumentasi dengan struktur project aktual
- Perbaikan format dan konsistensi dokumentasi

### Dokumentasi
- Penambahan contoh integrasi PHP yang lengkap
- Perbaikan dokumentasi setup environment
- Peningkatan clarity dalam panduan instalasi

## [1.2.0] - 2025-06-14

### Ditambahkan
- Dokumentasi struktur proyek yang komprehensif di README.md
- Deskripsi file dan direktori yang detail untuk navigasi kode yang lebih baik
- Dokumentasi yang ditingkatkan untuk semua file service dan tujuannya

### Diubah
- **BREAKING**: Memperbarui bagian struktur proyek di README.md untuk mencerminkan struktur repository yang sebenarnya
- Memindahkan dokumentasi app.js dari src/ ke level root (sesuai lokasi file sebenarnya)
- Meningkatkan deskripsi untuk middleware, routes, services, dan validators
- Meningkatkan kejelasan organisasi file dan arsitektur

### Diperbaiki
- Memperbaiki path file yang tidak akurat dalam dokumentasi struktur proyek
- Memperbaiki file yang hilang dalam dokumentasi (LICENSE, package-lock.json)
- Menyelaraskan dokumentasi dengan struktur codebase yang sebenarnya

### Dokumentasi
- Menambahkan dokumentasi file route yang hilang (email.js, sandbox.js)
- Meningkatkan deskripsi file service (emailService.js, paymentServiceFactory.js, sandboxPaymentService.js)
- Memperbaiki dokumentasi middleware dan validator
- Memperbarui dokumentasi struktur direktori example

## [1.1.0] - Rilis Sebelumnya

### Ditambahkan
- Sistem notifikasi email dengan dokumentasi yang komprehensif
- Mode sandbox untuk testing dan development
- Sistem manajemen API key
- Penanganan webhook untuk notifikasi pembayaran
- Fitur rate limiting dan keamanan
- Implementasi arsitektur yang bersih

### Fitur
- ✅ Pembayaran USDT pada jaringan BSC-20
- ✅ Generasi QR Code untuk integrasi Trust Wallet
- ✅ Verifikasi transaksi otomatis
- ✅ Notifikasi webhook untuk event pembayaran
- ✅ Rate limiting API dan keamanan
- ✅ Sistem manajemen API Key
- ✅ Arsitektur bersih dan penanganan error

### Dokumentasi
- Panduan setup dan instalasi lengkap
- Dokumentasi konfigurasi environment
- Dokumentasi endpoint API
- Contoh integrasi PHP
- Panduan troubleshooting

## [1.0.0] - Rilis Awal

### Ditambahkan
- Fungsionalitas inti crypto payment gateway
- Pemrosesan pembayaran BSC USDT
- Integrasi Trust Wallet
- Endpoint API dasar
- Sistem verifikasi pembayaran
- Dokumentasi awal

---

## Jenis Perubahan
- **Ditambahkan** untuk fitur baru
- **Diubah** untuk perubahan dalam fungsionalitas yang ada
- **Deprecated** untuk fitur yang akan segera dihapus
- **Dihapus** untuk fitur yang sekarang sudah dihapus
- **Diperbaiki** untuk perbaikan bug apapun
- **Keamanan** untuk perbaikan kerentanan
- **Dokumentasi** untuk perubahan dokumentasi

## Panduan Migrasi

### Dari v1.2.0 ke v1.3.0
Tidak ada perubahan breaking dalam fungsionalitas. Update meliputi:
- File .env.example baru untuk setup yang lebih mudah
- Contoh integrasi PHP yang ditingkatkan
- Dokumentasi bahasa Indonesia yang disederhanakan

### Dari v1.1.0 ke v1.2.0
Tidak ada perubahan breaking dalam fungsionalitas. Hanya update dokumentasi:
- Tinjau struktur proyek yang diperbarui di README.md
- Lokasi file tetap sama, hanya dokumentasi yang diperbaiki

### Rilis Mendatang
- Integrasi database (MongoDB/Redis)
- Fitur keamanan yang ditingkatkan
- Dukungan multi-currency
- Fitur webhook yang canggih
