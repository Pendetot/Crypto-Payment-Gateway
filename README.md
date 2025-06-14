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
>>>>>>> 4d57f5077353a453c5ab606270b78dee80cb3e1e
=======
- **[CHANGELOG.md](./CHANGELOG.md)** - Riwayat perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan lengkap mode sandbox untuk pengujian dan pengembangan
- **[EMAIL_DOCUMENTATION.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi payment gateway
=======
- **[CHANGELOG.md](./CHANGELOG.md)** - Riwayat perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan mode sandbox untuk testing
- **[EMAIL_DOCUMENTATION.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi
>>>>>>> 4d57f5077353a453c5ab606270b78dee80cb3e1e

## 🚀 Instalasi Cepat

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


#### 1. BSC RPC URL
- **Mainnet**: `https://bsc-dataseed1.binance.org/`
- **Testnet**: `https://data-seed-prebsc-1-s1.binance.org:8545/`

```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{

**"API key required"**
- Pastikan header `X-API-Key` ada dan valid

**"Transaction not found"**
- Pastikan RPC URL benar dan dapat diakses
- Tunggu konfirmasi block yang cukup


MIT License - lihat file [LICENSE](./LICENSE) untuk detail lengkap.


## Changelog

