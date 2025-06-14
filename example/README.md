# Contoh Penggunaan PHP - Crypto Payment Gateway

Folder ini berisi contoh-contoh kode PHP untuk mengintegrasikan Crypto Payment Gateway ke dalam aplikasi Anda.

## 📁 File yang Tersedia

### 1. `config.php`
File konfigurasi utama yang berisi:
- Pengaturan API URL dan API Key
- Konfigurasi database dan email
- Fungsi helper untuk logging, validasi, dan formatting
- Pengaturan environment (development, production, sandbox)

### 2. `create_payment.php`
Contoh cara membuat pembayaran baru:
- Fungsi `createPayment()` untuk membuat pembayaran
- Contoh penggunaan dengan metadata
- Error handling yang proper

### 3. `check_status.php`
Contoh cara mengecek status pembayaran:
- Fungsi `checkPaymentStatus()` untuk cek status
- Fungsi `waitForPayment()` untuk menunggu konfirmasi
- Command line interface untuk testing

### 4. `webhook_handler.php`
Contoh webhook handler untuk menerima notifikasi:
- Verifikasi signature webhook
- Handler untuk berbagai event (completed, expired, failed)
- Contoh integrasi dengan database dan email

### 5. `complete_example.php`
Contoh lengkap integrasi dalam aplikasi e-commerce:
- Class `CryptoPaymentGateway` untuk API wrapper
- Class `OrderManager` untuk mengelola pesanan
- Contoh flow lengkap dari pembuatan order hingga konfirmasi

## 🚀 Cara Penggunaan

### 1. Konfigurasi Awal

Edit file `config.php` dan sesuaikan dengan pengaturan Anda:

```php
define('API_URL', 'http://localhost:3000');
define('API_KEY', 'your-actual-api-key');
define('WEBHOOK_SECRET', 'your-actual-webhook-secret');
```

### 2. Membuat Pembayaran

```bash
php create_payment.php
```

Atau gunakan dalam kode Anda:

```php
require_once 'config.php';
require_once 'create_payment.php';

$payment = createPayment(100.50, 'ORDER-123', [
    'customer_email' => 'customer@example.com'
]);
```

### 3. Mengecek Status Pembayaran

```bash
php check_status.php <payment_id>
```

### 4. Setup Webhook

1. Upload `webhook_handler.php` ke server Anda
2. Konfigurasi webhook URL di payment gateway: `https://yourdomain.com/webhook_handler.php`
3. Pastikan webhook secret sudah benar di `config.php`

### 5. Integrasi Lengkap

Lihat `complete_example.php` untuk contoh integrasi lengkap:

```php
require_once 'complete_example.php';

$gateway = new CryptoPaymentGateway(API_URL, API_KEY);
$orderManager = new OrderManager($gateway);

$result = $orderManager->createOrder($customerData, $items, $totalAmount);
```

## 🔧 Requirements

- PHP 7.4 atau lebih tinggi
- Extension cURL untuk HTTP requests
- Extension JSON untuk parsing response

## 📝 Environment Variables

Anda dapat menggunakan file `.env` untuk konfigurasi:

```env
API_URL=http://localhost:3000
API_KEY=your-api-key-here
WEBHOOK_SECRET=your-webhook-secret-here
ENVIRONMENT=development
```

## 🛡️ Keamanan

1. **API Key**: Jangan pernah commit API key ke repository
2. **Webhook Secret**: Gunakan secret yang kuat dan unik
3. **HTTPS**: Selalu gunakan HTTPS di production
4. **Validasi**: Selalu validasi input dari user
5. **Logging**: Monitor dan log semua transaksi

## 🧪 Testing

### Mode Sandbox

Untuk testing, gunakan mode sandbox:

```php
define('ENVIRONMENT', 'sandbox');
```

### Testing Webhook

Gunakan tools seperti ngrok untuk testing webhook di development:

```bash
ngrok http 80
# Gunakan URL ngrok sebagai webhook URL
```

## 📊 Monitoring

File `payment_gateway.log` akan berisi log dari semua aktivitas:

```bash
tail -f payment_gateway.log
```

## 🆘 Troubleshooting

### Error "API key required"
- Pastikan API_KEY sudah diset dengan benar
- Cek apakah API key masih aktif

### Error "Invalid signature" pada webhook
- Pastikan WEBHOOK_SECRET sama dengan yang dikonfigurasi di gateway
- Cek apakah payload webhook tidak dimodifikasi

### Error "Connection refused"
- Pastikan payment gateway service berjalan
- Cek API_URL sudah benar

### Payment tidak terdeteksi
- Pastikan menggunakan exact amount yang diberikan
- Cek apakah transaksi sudah di-broadcast ke network
- Tunggu konfirmasi blockchain (biasanya 3-12 blok)

## 📚 Dokumentasi Lengkap

Untuk dokumentasi API lengkap, lihat:
- [README.md](../README.md) - Dokumentasi utama
- [SANDBOX.md](../SANDBOX.md) - Mode sandbox
- [EMAIL_DOCUMENTATION.md](../EMAIL_DOCUMENTATION.md) - Sistem email

## 💡 Tips

1. **Caching**: Implementasikan caching untuk mengurangi API calls
2. **Retry Logic**: Tambahkan retry logic untuk request yang gagal
3. **Database**: Simpan payment data di database untuk tracking
4. **Notification**: Implementasikan notifikasi real-time untuk user
5. **Analytics**: Track conversion rate dan payment success rate

## 🤝 Kontribusi

Jika Anda menemukan bug atau ingin menambahkan contoh baru, silakan buat issue atau pull request di repository utama.
