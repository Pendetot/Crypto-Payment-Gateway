# 📧 Sistem Notifikasi Email

## Gambaran Umum
Sistem notifikasi email yang komprehensif untuk Crypto Payment Gateway yang mendukung notifikasi otomatis untuk berbagai status pembayaran.

## 🌟 Fitur Utama

### 1. **Notifikasi Pembayaran Dibuat**
- Email otomatis saat pembayaran baru dibuat
- Berisi detail pembayaran dan instruksi
- QR code dan alamat wallet
- Waktu kedaluwarsa pembayaran

### 2. **Notifikasi Pembayaran Berhasil**
- Konfirmasi email saat pembayaran terverifikasi
- Detail transaksi dan hash blockchain
- Informasi langkah selanjutnya

### 3. **Notifikasi Pembayaran Kedaluwarsa**
- Peringatan email saat pembayaran expired
- Opsi untuk membuat pembayaran baru
- Informasi kontak support

### 4. **Mode Sandbox**
- Indikator visual untuk testing
- Konfigurasi email terpisah untuk development
- Ethereal Email untuk testing tanpa SMTP real

## 🚀 Penggunaan

### Konfigurasi Environment

#### Mode Produksi
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourcompany.com
```

#### Mode Sandbox
```bash
NODE_ENV=sandbox
ETHEREAL_USER=test@ethereal.email
ETHEREAL_PASS=test-password
```

### Endpoint API

#### 1. Status Layanan Email
```bash
GET /api/email/status
Headers: X-API-Key: your-api-key
```

#### 2. Uji Coba Email
```bash
POST /api/email/test
Headers: 
  Content-Type: application/json
  X-API-Key: your-api-key
Body:
{
  "email": "test@example.com"
}
```

#### 3. Notifikasi Pembayaran Dibuat
```bash
POST /api/email/payment-created
Headers: 
  Content-Type: application/json
  X-API-Key: your-api-key
Body:
{
  "email": "customer@example.com",
  "paymentData": {
    "paymentId": "uuid",
    "amount": "100.50",
    "originalAmount": "100.00",
    "orderId": "ORDER123",
    "walletAddress": "0x...",
    "expiresAt": "2025-06-14T13:09:30.513Z"
  }
}
```

#### 4. Notifikasi Pembayaran Berhasil
```bash
POST /api/email/payment-success
Headers: 
  Content-Type: application/json
  X-API-Key: your-api-key
Body:
{
  "email": "customer@example.com",
  "paymentData": {
    "paymentId": "uuid",
    "amount": "100.50",
    "originalAmount": "100.00",
    "orderId": "ORDER123",
    "txHash": "0x...",
    "verifiedAt": "2025-06-14T13:09:30.513Z"
  }
}
```

#### 5. Notifikasi Pembayaran Kedaluwarsa
```bash
POST /api/email/payment-expired
Headers: 
  Content-Type: application/json
  X-API-Key: your-api-key
Body:
{
  "email": "customer@example.com",
  "paymentData": {
    "paymentId": "uuid",
    "amount": "100.50",
    "originalAmount": "100.00",
    "orderId": "ORDER123",
    "expiresAt": "2025-06-14T13:09:30.513Z"
  }
}
```

## 🎨 Template Email

### Fitur Template
- **Desain Responsif**: Kompatibel dengan semua klien email
- **Tata Letak Profesional**: Desain modern dan bersih
- **Konsistensi Merek**: Konsisten dengan identitas merek
- **Indikator Sandbox**: Indikator visual untuk mode pengujian
- **Dukungan Multi-bahasa**: Siap untuk internasionalisasi

### Struktur Template
- Header dengan logo dan judul
- Konten utama dengan informasi pembayaran
- Tombol call-to-action
- Footer dengan informasi kontak
- Responsif untuk mobile dan desktop

## 🔧 Integrasi dengan Alur Pembayaran

### Pemicu Otomatis
Email dapat dipicu otomatis pada event berikut:
1. **Pembayaran Dibuat**: Saat pembayaran baru dibuat
2. **Pembayaran Terverifikasi**: Saat pembayaran berhasil diverifikasi
3. **Pembayaran Kedaluwarsa**: Saat pembayaran melewati batas waktu

### Pemicu Manual
Email juga dapat dipicu manual melalui API untuk:
- Pengujian dan debugging
- Mengirim ulang notifikasi
- Skenario khusus

## 🛡️ Keamanan & Privasi

### Perlindungan Data
- Alamat email tidak disimpan permanen
- Enkripsi data sensitif dalam transit
- Pembatasan rate untuk mencegah spam
- Validasi input yang ketat

### Autentikasi
- API key diperlukan untuk semua endpoint
- Kontrol akses berbasis izin
- Audit logging untuk pelacakan

## 📊 Pemantauan & Analitik

### Logging
- Status pengiriman email
- Pelacakan error dan debugging
- Metrik performa
- Pelacakan keterlibatan pengguna

### Penanganan Error
- Fallback yang elegan untuk kegagalan SMTP
- Mekanisme retry untuk pengiriman yang gagal
- Pelaporan error yang detail
- Endpoint health check

## 🚀 Deployment

### Pengaturan Produksi
1. Konfigurasi kredensial SMTP
2. Atur record DNS yang tepat (SPF, DKIM)
3. Konfigurasi pembatasan rate
4. Atur pemantauan dan alert

### Pengaturan Pengujian
1. Gunakan Ethereal Email untuk development
2. Uji semua template email
3. Verifikasi desain responsif
4. Uji skenario error

## 📈 Peningkatan di Masa Depan

### Fitur yang Direncanakan
- Kustomisasi template email
- Dukungan multi-bahasa
- Dashboard analitik lanjutan
- Integrasi webhook
- Kemampuan email massal
- A/B testing untuk template

### Peluang Integrasi
- Integrasi sistem CRM
- Otomatisasi pemasaran
- Sistem tiket dukungan pelanggan
- Platform analitik
- Notifikasi push mobile

## 🆘 Pemecahan Masalah

### Masalah Umum
1. **Autentikasi SMTP Gagal**
   - Verifikasi kredensial
   - Periksa pengaturan app password
   - Pastikan 2FA dikonfigurasi

2. **Email Tidak Terkirim**
   - Periksa folder spam
   - Verifikasi record DNS
   - Pantau log pengiriman

3. **Masalah Rendering Template**
   - Uji dengan klien email yang berbeda
   - Validasi struktur HTML
   - Periksa kompatibilitas CSS

### Dukungan
Untuk bantuan teknis, hubungi tim development atau buat issue di repository GitHub.
