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

## 📚 Dokumentasi Lengkap

- **[CHANGELOG.md](./CHANGELOG.md)** - Riwayat perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan mode sandbox untuk testing
- **[EMAIL_DOCUMENTATION.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi

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
npm run dev  # Development
npm start    # Production
```

## ⚙️ Konfigurasi Environment

### Konfigurasi Dasar (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Blockchain BSC
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Wallet
WALLET_ADDRESS=alamat_wallet_anda
WALLET_PRIVATE_KEY=private_key_tanpa_0x

# Security
API_KEY=api_key_anda
WEBHOOK_SECRET=webhook_secret_anda

# Payment
PAYMENT_TIMEOUT=1800
MIN_CONFIRMATIONS=12
```

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

### Membuat Pembayaran
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

### Cek Status Pembayaran
```bash
curl -X GET http://localhost:3000/api/payment/status/PAYMENT_ID \
  -H "X-API-Key: your_api_key"
```

### Cek Saldo Wallet
```bash
curl -X GET http://localhost:3000/api/payment/balance \
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
├── app.js                  # Entry point aplikasi
├── .env.example            # Template environment
├── package.json            # Dependencies
├── src/                    # Source code utama
│   ├── middleware/         # Middleware functions
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   └── validators/         # Input validation
└── example/                # Contoh integrasi PHP
```

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
