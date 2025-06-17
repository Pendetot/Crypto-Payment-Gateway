# 🚀 Crypto Payment Gateway - BSC USDT

Gateway pembayaran cryptocurrency modern untuk menerima pembayaran USDT di jaringan Binance Smart Chain (BSC) dengan integrasi Trust Wallet, database SQLite3, dan sistem notifikasi email lengkap.

## ✨ Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| 💰 **USDT BSC-20** | ✅ | Pembayaran USDT di jaringan Binance Smart Chain |
| 📱 **Trust Wallet** | ✅ | Generate QR Code untuk integrasi Trust Wallet |
| 🔍 **Auto Verify** | ✅ | Verifikasi transaksi blockchain otomatis |
| 📡 **Webhooks** | ✅ | Notifikasi real-time untuk pembayaran |
| 🛡️ **Security** | ✅ | Rate limiting, API key authentication, dan CORS protection |
| 🗄️ **SQLite3 Database** | ✅ | Penyimpanan persisten dengan database relational |
| 🔧 **Clean Architecture** | ✅ | Error handling dan struktur kode yang rapi |
| 🧪 **Sandbox Mode** | ✅ | Mode testing lengkap untuk development |
| 📧 **Email Notifications** | ✅ | Sistem notifikasi email otomatis |
| 🔑 **API Key Management** | ✅ | Manajemen API key dengan sistem permissions |
| 📊 **Transaction Logging** | ✅ | Log transaksi lengkap untuk audit trail |
| 🎯 **Unique Amount System** | ✅ | Sistem amount unik untuk mencegah duplikasi |

## 📚 Dokumentasi Lengkap

- **[CHANGELOG.md](./CHANGELOG.md)** - Riwayat perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan mode sandbox untuk testing
- **[EMAIL_DOCUMENTATION.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi

## 🚀 Instalasi Cepat

### 📋 Prerequisites
- Node.js >= 16.0.0
- npm atau yarn
- Git

### 🔧 Langkah Instalasi

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/Pendetot/Crypto-Payment-Gateway.git
cd Crypto-Payment-Gateway
```

#### 2️⃣ Install Dependencies
```bash
npm install
```

#### 3️⃣ Setup Environment
```bash
cp .env.example .env
```
Edit file `.env` dan sesuaikan dengan konfigurasi Anda:
- `WALLET_ADDRESS`: Alamat wallet BSC Anda
- `API_KEY`: Akan di-generate otomatis jika kosong

#### 4️⃣ Jalankan Aplikasi
```bash
# Development mode
npm run dev

# Production mode
npm start

# Sandbox mode
npm run sandbox:dev
```

#### 5️⃣ Verifikasi Installation
```bash
curl http://localhost:3000/health
```

## ⚙️ Konfigurasi Environment

### Konfigurasi Dasar (.env)
```env
# API Configuration
API_KEY=your_generated_api_key

# Blockchain Configuration
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
WALLET_ADDRESS=your_wallet_address

# Payment Configuration
PAYMENT_TIMEOUT=1800
MIN_CONFIRMATIONS=3

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=200

# Environment
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# CORS
ALLOWED_ORIGINS=*

# Database
DATABASE_URL=./crypto_payment_gateway.db

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Sandbox Email (untuk testing)
ETHEREAL_USER=ethereal.user@ethereal.email
ETHEREAL_PASS=ethereal.pass
```

### 🗄️ Database SQLite3

Aplikasi menggunakan SQLite3 untuk penyimpanan persisten dengan schema lengkap:

- **payments**: Data pembayaran dengan status, metadata, dan tracking
- **api_keys**: Manajemen API key dengan sistem permissions
- **used_amounts**: Tracking unique amount untuk mencegah duplikasi
- **transaction_logs**: Log transaksi lengkap untuk audit trail

Database akan dibuat otomatis saat aplikasi pertama kali dijalankan dengan schema yang sudah terdefinisi.

### 📧 Sistem Email

Aplikasi mendukung notifikasi email otomatis untuk:
- Payment created (pembayaran dibuat)
- Payment success (pembayaran berhasil)
- Payment expired (pembayaran kadaluarsa)
- Test email untuk verifikasi konfigurasi

### Cara Mendapatkan Konfigurasi

#### 1. BSC RPC URL
- **Mainnet**: `https://bsc-dataseed1.binance.org/`
- **Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545/`

#### 2. USDT Contract Address
- **BSC Mainnet**: `0x55d398326f99059fF775485246999027B3197955`
- **BSC Testnet**: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`

#### 3. Wallet Address
Gunakan MetaMask atau Trust Wallet untuk membuat wallet baru.

**⚠️ PENTING**: Jangan pernah share private key Anda!

## 🔧 Penggunaan API

### 🔑 Authentication
Semua endpoint memerlukan API Key di header:
```bash
X-API-Key: your_api_key_here
# atau
Authorization: Bearer your_api_key_here
```

### 📋 Endpoint Utama

#### 1️⃣ Health Check
```bash
curl http://localhost:3000/health
```

#### 2️⃣ API Documentation
```bash
curl http://localhost:3000/api/docs
```

#### 3️⃣ Membuat Pembayaran
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.5,
    "orderId": "ORDER001",
    "metadata": {"customer": "John Doe"}
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-here",
    "amount": "10.67",
    "walletAddress": "0x...",
    "qrCode": "data:image/png;base64,...",
    "trustWalletUrl": "trust://...",
    "expiresAt": "2025-01-01T12:00:00Z"
  }
}
```

#### 4️⃣ Verifikasi Pembayaran
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "uuid-here",
    "txHash": "0x..."
  }'
```

#### 5️⃣ Cek Status Pembayaran
```bash
curl http://localhost:3000/api/payment/status/PAYMENT_ID \
  -H "X-API-Key: your_api_key"
```

#### 6️⃣ Cek Saldo Wallet
```bash
curl http://localhost:3000/api/payment/balance \
  -H "X-API-Key: your_api_key"
```

#### 7️⃣ List Pembayaran (Admin)
```bash
curl http://localhost:3000/api/payment/list \
  -H "X-API-Key: your_admin_api_key"
```

### 🔑 API Key Management

#### Membuat API Key Baru (Admin)
```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "X-API-Key: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App Key",
    "permissions": ["payment:create", "payment:status"]
  }'
```

#### List API Keys (Admin)
```bash
curl http://localhost:3000/api/keys/list \
  -H "X-API-Key: your_admin_api_key"
```

#### Info API Key Saat Ini
```bash
curl http://localhost:3000/api/keys/info \
  -H "X-API-Key: your_api_key"
```

### 📧 Email Notifications

#### Send Test Email (Admin)
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "X-API-Key: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

#### Send Payment Created Notification
```bash
curl -X POST http://localhost:3000/api/email/payment-created \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "paymentData": {
      "paymentId": "uuid-here",
      "amount": "10.67",
      "orderId": "ORDER001"
    }
  }'
```

### 🧪 Sandbox Mode

#### Simulasi Pembayaran
```bash
curl -X POST http://localhost:3000/api/sandbox/simulate/PAYMENT_ID \
  -H "X-API-Key: your_api_key"
```

#### Info Sandbox
```bash
curl http://localhost:3000/api/sandbox/info \
  -H "X-API-Key: your_api_key"
```

## 📱 Integrasi PHP

Lihat folder `example/` untuk contoh lengkap integrasi dengan PHP:

- `create_payment.php` - Membuat pembayaran baru
- `check_status.php` - Cek status pembayaran
- `webhook_handler.php` - Handle webhook notifikasi
- `complete_example.php` - Contoh integrasi lengkap dengan class wrapper

### Contoh Penggunaan PHP
```php
<?php
require_once 'complete_example.php';

$gateway = new CryptoPaymentGateway('http://localhost:3000', 'your_api_key');

// Membuat pembayaran
$payment = $gateway->createPayment(10.5, 'ORDER001', [
    'customer' => 'John Doe',
    'email' => 'john@example.com'
]);

if ($payment['success']) {
    echo "Payment ID: " . $payment['data']['paymentId'];
    echo "QR Code: " . $payment['data']['qrCode'];
}
?>
```

## 🔒 Keamanan

- **Rate limiting**: 200 request per 15 menit per IP address
- **API key authentication**: Semua endpoint dilindungi API key
- **Permissions system**: Granular permissions untuk setiap API key
- **Webhook signature verification**: Verifikasi signature untuk webhook
- **Input validation**: Validasi input menggunakan Joi
- **CORS protection**: Konfigurasi CORS yang aman
- **Helmet.js**: Security headers otomatis
- **SQL injection protection**: Menggunakan prepared statements

### Sistem Permissions
- `payment:create` - Membuat pembayaran baru
- `payment:verify` - Verifikasi pembayaran
- `payment:status` - Cek status pembayaran
- `payment:balance` - Lihat saldo wallet
- `admin` - Akses penuh ke semua endpoint

## 🧪 Mode Testing

### Sandbox Mode
Gunakan mode sandbox untuk testing tanpa transaksi real:

```bash
npm run sandbox:dev
```

Mode sandbox menyediakan:
- Mock blockchain transactions
- Simulasi pembayaran
- Test email dengan Ethereal Email
- Mock wallet addresses
- Payment simulation endpoints

Baca [SANDBOX.md](./SANDBOX.md) untuk panduan lengkap.

### Testing dengan Jest
```bash
npm test
```

## 🛠️ Troubleshooting

### Masalah Umum

**"API key required"**
- Pastikan header `X-API-Key` ada dan valid
- Cek apakah API key masih aktif dan belum expired

**"Insufficient permissions"**
- Pastikan API key memiliki permission yang sesuai
- Gunakan API key dengan permission `admin` untuk endpoint admin

**"Transaction not found"**
- Pastikan RPC URL benar dan dapat diakses
- Tunggu konfirmasi block yang cukup
- Cek apakah transaction hash valid

**"Invalid transaction"**
- Pastikan amount sesuai dengan unique amount
- Cek contract address USDT BSC
- Pastikan menggunakan BSC network

**"Payment not found"**
- Cek format paymentId (harus UUID)
- Payment mungkin sudah expired
- Pastikan payment ID benar

**"Database error"**
- Pastikan aplikasi memiliki permission write ke direktori database
- Cek apakah SQLite3 terinstall dengan benar

**"Email sending failed"**
- Verifikasi konfigurasi SMTP
- Cek kredensial email
- Pastikan less secure apps enabled (untuk Gmail)

### Debug Mode
```env
NODE_ENV=development
DEBUG=*
```

### Logs
Aplikasi menggunakan Morgan untuk HTTP request logging dan menyimpan transaction logs di database.

## 📊 Struktur Project

```
crypto-payment-gateway/
├── app.js                          # Entry point aplikasi
├── .env                            # Environment configuration
├── package.json                    # Dependencies dan scripts
├── crypto_payment_gateway.db       # SQLite3 database file
├── src/                            # Source code utama
│   ├── middleware/                 # Middleware functions
│   │   ├── auth.js                 # Authentication & API key management
│   │   └── errorHandler.js         # Error handling middleware
│   ├── routes/                     # API route handlers
│   │   ├── payment.js              # Payment endpoints
│   │   ├── webhook.js              # Webhook handlers
│   │   ├── apiKeys.js              # API key management
│   │   ├── sandbox.js              # Sandbox mode endpoints
│   │   └── email.js                # Email notification endpoints
│   ├── services/                   # Business logic
│   │   ├── databaseService.js      # SQLite3 database operations
│   │   ├── paymentService.js       # Payment processing (production)
│   │   ├── sandboxPaymentService.js # Payment processing (sandbox)
│   │   ├── paymentServiceFactory.js # Service factory pattern
│   │   └── emailService.js         # Email service dengan Nodemailer
│   ├── validators/                 # Input validation
│   │   └── paymentValidator.js     # Payment validation dengan Joi
│   └── database/                   # Database schema
│       └── schema.sql              # SQLite3 table definitions
└── example/                        # Contoh integrasi PHP
    ├── README.md                   # Dokumentasi contoh PHP
    ├── config.php                  # Konfigurasi PHP
    ├── create_payment.php          # Membuat pembayaran
    ├── check_status.php            # Cek status pembayaran
    ├── webhook_handler.php         # Handle webhook
    └── complete_example.php        # Contoh lengkap dengan class wrapper
```

## 🗄️ Database Schema

### Tables:
- **payments**: Data pembayaran dengan status, metadata, dan tracking lengkap
- **api_keys**: API keys dengan hash, permissions, dan expiry
- **used_amounts**: Tracking unique amounts untuk mencegah duplikasi
- **transaction_logs**: Log transaksi untuk audit trail

### Features:
- Auto-initialization saat startup
- Data cleanup untuk expired records
- Proper indexing untuk performance optimal
- Graceful shutdown handling
- Foreign key constraints untuk data integrity

### Indexes:
- `idx_payments_status`: Index pada status pembayaran
- `idx_payments_order_id`: Index pada order ID
- `idx_payments_created_at`: Index pada tanggal pembuatan
- `idx_api_keys_active`: Index pada status aktif API key
- `idx_used_amounts_expires`: Index pada expiry unique amounts
- `idx_transaction_logs_payment_id`: Index pada payment ID di transaction logs

## 🤝 Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/fitur-baru`
3. Commit perubahan: `git commit -am 'Tambah fitur baru'`
4. Push ke branch: `git push origin feature/fitur-baru`
5. Buat Pull Request

## 📄 License

MIT License - lihat file [LICENSE](./LICENSE) untuk detail lengkap.

## 💬 Support

Untuk support dan pertanyaan:
- Buat issue di GitHub repository
- Instagram: @AOL_RA

---

**⚠️ Catatan Keamanan:**
- Jangan commit file `.env` ke repository
- Gunakan password dan secret yang kuat
- Update dependencies secara berkala
- Monitor logs untuk aktivitas mencurigakan
- Backup private key dengan aman
- Gunakan HTTPS di production
- Implementasikan proper firewall rules
- Regular security audit untuk API keys

**🚀 Tips Performance:**
- Gunakan connection pooling untuk database
- Implement caching untuk frequent queries
- Monitor memory usage dan optimize
- Use PM2 atau similar untuk production deployment
- Regular database maintenance dan cleanup
