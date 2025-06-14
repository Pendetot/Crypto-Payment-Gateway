# Mode Sandbox

Gateway Pembayaran Kripto menyertakan mode sandbox yang komprehensif untuk pengujian dan pengembangan yang aman tanpa menggunakan transaksi cryptocurrency nyata.

## Fitur

- **Pemrosesan Pembayaran Tiruan**: Membuat dan mengelola pembayaran tanpa transaksi blockchain nyata
- **Simulasi Verifikasi Transaksi**: Menguji verifikasi pembayaran dengan hash transaksi tiruan
- **Lingkungan Pengujian Aman**: Tidak ada risiko kehilangan dana nyata selama pengembangan
- **Endpoint Khusus Sandbox**: Endpoint API tambahan untuk skenario pengujian
- **Indikator Visual**: Kode QR berwarna oranye dan label sandbox yang jelas

## Memulai

### Mengaktifkan Mode Sandbox

Atur salah satu variabel lingkungan berikut:

```bash
# Opsi 1: Atur NODE_ENV ke sandbox
NODE_ENV=sandbox

# Opsi 2: Gunakan flag SANDBOX_MODE
SANDBOX_MODE=true

# Opsi 3: Atur variabel ENVIRONMENT
ENVIRONMENT=sandbox
```

### Menjalankan dalam Mode Sandbox

```bash
# Mulai dalam mode sandbox
npm run sandbox

# Mode pengembangan dengan auto-reload
npm run sandbox:dev
```

## Sandbox vs Produksi

| Fitur | Produksi | Sandbox |
|-------|----------|---------|
| Blockchain | BSC Mainnet | Tiruan/Simulasi |
| Transaksi | USDT Nyata | Simulasi |
| Dompet | Alamat dompet nyata | Dompet tiruan |
| Kode QR | Hitam | Oranye (indikator visual) |
| Timeout Pembayaran | Dapat dikonfigurasi | 30 menit |
| Konfirmasi | Blockchain nyata | Simulasi (3 konfirmasi) |

## Endpoint API

### Endpoint Khusus Sandbox

Semua endpoint sandbox hanya tersedia saat berjalan dalam mode sandbox.

#### Mendapatkan Informasi Sandbox
```http
GET /api/sandbox/info
```

Mengembalikan detail lingkungan sandbox dan statistik.

#### Simulasi Pembayaran
```http
POST /api/sandbox/simulate/{paymentId}
```

Secara otomatis menyelesaikan pembayaran dengan transaksi tiruan.

#### Membuat Pembayaran Uji
```http
POST /api/sandbox/test-payment
Content-Type: application/json
X-API-Key: your-api-key

{
  "amount": 10,
  "orderId": "TEST-123",
  "scenario": "normal"
}
```

#### Mendapatkan Semua Pembayaran Sandbox
```http
GET /api/sandbox/payments
X-API-Key: admin-api-key
```

#### Menghapus Semua Data Sandbox
```http
DELETE /api/sandbox/payments
X-API-Key: admin-api-key
```

#### Mendapatkan Statistik Sandbox
```http
GET /api/sandbox/stats
X-API-Key: your-api-key
```

## Alur Kerja Pengujian

### 1. Membuat Pembayaran Uji

```bash
curl -X POST http://localhost:3000/api/payment/create   -H "Content-Type: application/json"   -H "X-API-Key: your-api-key"   -d '{
    "amount": 25.50,
    "orderId": "TEST-ORDER-123"
  }'
```

### 2. Simulasi Penyelesaian Pembayaran

```bash
curl -X POST http://localhost:3000/api/sandbox/simulate/{paymentId}   -H "X-API-Key: your-api-key"
```

### 3. Memeriksa Status Pembayaran

```bash
curl -X GET http://localhost:3000/api/payment/status/{paymentId}   -H "X-API-Key: your-api-key"
```

## Deteksi Lingkungan

Aplikasi secara otomatis mendeteksi mode sandbox dan menampilkan indikator yang sesuai:

- **Health Check**: Endpoint `/health` menunjukkan lingkungan saat ini
- **Dokumentasi API**: `/api/docs` menyertakan endpoint sandbox saat aktif
- **Output Konsol**: Indikasi yang jelas antara mode sandbox vs produksi
- **Kode QR**: Skema warna oranye untuk pembayaran sandbox

## Data Tiruan

### Alamat Dompet Sandbox
```
0x742d35Cc6634C0532925a3b8D4C9db96590c0000
```

### Hash Transaksi Tiruan
Sandbox menghasilkan hash transaksi yang terlihat realistis:
```
0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Saldo Tiruan
- **BNB**: Saldo acak antara 1-11 BNB
- **USDT**: Saldo acak antara 100-1100 USDT

## Praktik Terbaik

1. **Selalu Gunakan Sandbox untuk Pengembangan**: Jangan pernah menguji dengan dana nyata
2. **Bersihkan Data Sandbox**: Gunakan `DELETE /api/sandbox/payments` di antara sesi pengujian
3. **Pantau Statistik Sandbox**: Gunakan `/api/sandbox/stats` untuk melacak kemajuan pengujian
4. **Uji Skenario Berbeda**: Gunakan berbagai jumlah dan ID pesanan
5. **Verifikasi Lingkungan**: Periksa endpoint `/health` untuk mengonfirmasi mode sandbox

## Pemecahan Masalah

### Endpoint Sandbox Mengembalikan 403
- Pastikan `NODE_ENV=sandbox` atau `SANDBOX_MODE=true` telah diatur
- Restart aplikasi setelah mengubah variabel lingkungan

### Transaksi Tiruan Tidak Berfungsi
- Verifikasi bahwa Anda menggunakan endpoint khusus sandbox
- Periksa bahwa pembayaran ada dan dalam status "pending"

### Kode QR Masih Hitam
- Konfirmasi mode sandbox aktif melalui `/api/sandbox/info`
- Bersihkan cache browser jika menguji di browser

## Catatan Keamanan

- Mode sandbox hanya untuk pengembangan
- Jangan pernah gunakan konfigurasi sandbox dalam produksi
- Data sandbox disimpan dalam memori dan akan hilang saat restart
- Transaksi tiruan tidak memiliki validasi blockchain nyata

## Pengujian Integrasi

```javascript
// Contoh pengujian menggunakan mode sandbox
const response = await fetch('/api/sandbox/test-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'test-key'
  },
  body: JSON.stringify({
    amount: 10,
    orderId: 'TEST-' + Date.now()
  })
});

const payment = await response.json();
const paymentId = payment.data.paymentId;

// Simulasi penyelesaian pembayaran
await fetch(`/api/sandbox/simulate/${paymentId}`, {
  method: 'POST',
  headers: { 'X-API-Key': 'test-key' }
});

// Verifikasi status pembayaran
const status = await fetch(`/api/payment/status/${paymentId}`, {
  headers: { 'X-API-Key': 'test-key' }
});
```
