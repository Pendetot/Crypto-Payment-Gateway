# Crypto Payment Gateway - BSC USDT

Gateway pembayaran crypto untuk menerima pembayaran USDT di jaringan Binance Smart Chain (BSC) dengan integrasi Trust Wallet.

## ✨ Fitur Utama

- ✅ Pembayaran USDT di jaringan BSC-20
- ✅ Generate QR Code untuk Trust Wallet
- ✅ Verifikasi transaksi otomatis
- ✅ Webhook untuk notifikasi pembayaran
- ✅ Rate limiting dan keamanan API
- ✅ Sistem manajemen API Key
- ✅ Clean architecture dan error handling
- ✅ Mode sandbox untuk testing

## 📚 Dokumentasi

Untuk informasi lebih detail, silakan baca dokumentasi berikut:

- **[CHANGELOG.md](./CHANGELOG.md)** - Catatan perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan lengkap mode sandbox untuk pengujian dan pengembangan
- **[EMAIL_DOCUMENTATION.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi payment gateway

## 🚀 Instalasi Cepat

### 1. Clone Repository
```bash
git clone https://github.com/Pendetot/Crypto-Payment-Gateway.git
cd Crypto-Payment-Gateway
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit file .env sesuai konfigurasi Anda
```

### 4. Jalankan Aplikasi
```bash
npm run dev  # Development mode
npm start    # Production mode
```

## 📋 Struktur Project

```
crypto-payment-gateway/
├── app.js                  # Main application entry point
├── package.json            # Dependencies dan scripts
├── package-lock.json       # Lock file untuk dependencies
├── LICENSE                 # License file
├── README.md               # Dokumentasi utama
├── CHANGELOG.md            # Catatan perubahan dan update
├── SANDBOX.md              # Dokumentasi mode sandbox
├── EMAIL_DOCUMENTATION.md  # Dokumentasi sistem email
├── .env.example           # Template environment variables
├── src/                    # Source code utama
│   ├── middleware/         # Middleware functions
│   │   ├── auth.js         # Authentication & authorization
│   │   └── errorHandler.js # Error handling middleware
│   ├── routes/             # API route handlers
│   │   ├── apiKeys.js      # API key management endpoints
│   │   ├── email.js        # Email notification endpoints
│   │   ├── payment.js      # Payment endpoints
│   │   ├── sandbox.js      # Sandbox mode endpoints
│   │   └── webhook.js      # Webhook handlers
│   ├── services/           # Business logic services
│   │   ├── emailService.js         # Email notification service
│   │   ├── paymentService.js       # Core payment logic
│   │   ├── paymentServiceFactory.js # Payment service factory
│   │   └── sandboxPaymentService.js # Sandbox payment service
│   └── validators/         # Input validation
│       └── paymentValidator.js     # Payment input validation
└── example/                # Contoh kode PHP untuk integrasi
    ├── README.md           # Panduan penggunaan contoh
    ├── config.php          # Konfigurasi dan helper functions
    ├── create_payment.php  # Contoh membuat pembayaran
    ├── check_status.php    # Contoh cek status pembayaran
    ├── webhook_handler.php # Contoh webhook handler
    └── complete_example.php # Contoh integrasi lengkap
```

## 🔧 Konfigurasi Environment

Salin file `.env.example` ke `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Blockchain Configuration
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Wallet Configuration
WALLET_ADDRESS=your_wallet_address_here
WALLET_PRIVATE_KEY=your_private_key_here

# Security Configuration
API_KEY=your_api_key_here
WEBHOOK_SECRET=your_webhook_secret_here

# Payment Configuration
PAYMENT_TIMEOUT=1800
MIN_CONFIRMATIONS=12
```

## 📖 Changelog

Untuk melihat riwayat perubahan lengkap dan update terbaru, silakan baca [CHANGELOG.md](./CHANGELOG.md).

## 📞 Support

- 📧 Email: support@yourcompany.com
- 📖 Documentation: Lihat folder dokumentasi
- 🐛 Issues: [GitHub Issues](https://github.com/Pendetot/Crypto-Payment-Gateway/issues)

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.
