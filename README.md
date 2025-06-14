# 🚀 Crypto Payment Gateway - BSC USDT

Gateway pembayaran cryptocurrency modern untuk menerima pembayaran USDT di jaringan Binance Smart Chain (BSC) dengan integrasi Trust Wallet dan penyimpanan database SQLite3.

## ✨ Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| 💰 **USDT BSC-20** | ✅ | Pembayaran USDT di jaringan Binance Smart Chain |
| 📱 **Trust Wallet** | ✅ | Generate QR Code untuk integrasi Trust Wallet |
| 🔍 **Auto Verify** | ✅ | Verifikasi transaksi blockchain otomatis |
| 📡 **Webhooks** | ✅ | Notifikasi real-time untuk pembayaran |
| 🛡️ **Security** | ✅ | Rate limiting dan autentikasi API Key |
| 🗄️ **SQLite3 Database** | ✅ | Penyimpanan persisten dengan database |
| 🔧 **Clean Architecture** | ✅ | Error handling dan struktur kode yang rapi |
| 🧪 **Sandbox Mode** | ✅ | Mode testing untuk development |

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
```

### 🗄️ Database SQLite3

Aplikasi sekarang menggunakan SQLite3 untuk penyimpanan persisten:

- **Payments**: Semua data pembayaran disimpan di database
- **API Keys**: Manajemen API key dengan enkripsi hash
- **Used Amounts**: Tracking unique amount untuk mencegah duplikasi
- **Transaction Logs**: Log semua transaksi untuk audit

Database akan dibuat otomatis saat aplikasi pertama kali dijalankan.

### Cara Mendapatkan Konfigurasi

#### 1. BSC RPC URL
- **Mainnet**: `https://bsc-dataseed1.binance.org/`
- **Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545/`

#### 2. USDT Contract Address
- **BSC Mainnet**: `0x55d398326f99059fF775485246999027B3197955`
- **BSC Testnet**: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`

#### 3. Wallet Address & Private Key
Gunakan MetaMask atau Trust Wallet untuk membuat wallet baru, lalu export private key.

**⚠️ PENTING**: Jangan pernah share private key Anda!

## 🔧 Penggunaan API

### 🔑 Authentication
Semua endpoint memerlukan API Key di header:
```bash
X-API-Key: your_api_key_here
```

### 📋 Endpoint Utama

#### 1️⃣ Health Check
```bash
curl http://localhost:3000/health
```

#### 2️⃣ Membuat Pembayaran
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
    "expiresAt": "2025-01-01T12:00:00Z"
  }
}
```

#### 3️⃣ Cek Status Pembayaran
```bash
curl http://localhost:3000/api/payment/status/PAYMENT_ID \
  -H "X-API-Key: your_api_key"
```

#### 4️⃣ Cek Saldo Wallet
```bash
curl http://localhost:3000/api/payment/balance \
  -H "X-API-Key: your_api_key"
```

## 📱 Integrasi PHP

Lihat folder `example/` untuk contoh lengkap integrasi dengan PHP:

- `create_payment.php` - Membuat pembayaran baru
- `check_status.php` - Cek status pembayaran
- `webhook_handler.php` - Handle webhook notifikasi
- `complete_example.php` - Contoh integrasi lengkap

## 🔒 Keamanan

- Rate limiting: 100 request per 15 menit per API key
- API key authentication untuk semua endpoint
- Webhook signature verification
- Input validation dan sanitization
- CORS protection

## 🧪 Mode Testing

Gunakan mode sandbox untuk testing tanpa transaksi real:

```bash
npm run sandbox:dev
```

Baca [SANDBOX.md](./SANDBOX.md) untuk panduan lengkap.

## 🛠️ Troubleshooting

### Masalah Umum

**"API key required"**
- Pastikan header `X-API-Key` ada dan valid

**"Transaction not found"**
- Pastikan RPC URL benar dan dapat diakses
- Tunggu konfirmasi block yang cukup

**"Invalid transaction"**
- Pastikan amount sesuai dengan unique amount
- Cek contract address USDT BSC
- Pastikan menggunakan BSC network

**"Payment not found"**
- Cek format paymentId (harus UUID)
- Payment mungkin sudah expired

### Debug Mode
```env
NODE_ENV=development
DEBUG=*
```

## 📊 Struktur Project

```
crypto-payment-gateway/
├── app.js                          # Entry point aplikasi
├── .env                            # Environment configuration
├── package.json                    # Dependencies
├── crypto_payment_gateway.db       # SQLite3 database file
├── src/                            # Source code utama
│   ├── middleware/                 # Middleware functions
│   │   ├── auth.js                 # Authentication & API key management
│   │   └── errorHandler.js         # Error handling middleware
│   ├── routes/                     # API route handlers
│   │   ├── payment.js              # Payment endpoints
│   │   ├── webhook.js              # Webhook handlers
│   │   ├── apiKeys.js              # API key management
│   │   ├── sandbox.js              # Sandbox mode
│   │   └── email.js                # Email notifications
│   ├── services/                   # Business logic
│   │   ├── databaseService.js      # SQLite3 database operations
│   │   ├── paymentService.js       # Payment processing
│   │   ├── paymentServiceFactory.js # Service factory
│   │   └── emailService.js         # Email service
│   └── validators/                 # Input validation
│       └── paymentValidator.js     # Payment validation
└── example/                        # Contoh integrasi PHP
```

## 🗄️ Database Schema

### Tables:
- **payments**: Data pembayaran dengan status dan metadata
- **api_keys**: API keys dengan hash dan permissions
- **used_amounts**: Tracking unique amounts untuk mencegah duplikasi
- **transaction_logs**: Log transaksi untuk audit trail

### Features:
- Auto-initialization saat startup
- Data cleanup untuk expired records
- Proper indexing untuk performance
- Graceful shutdown handling

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
