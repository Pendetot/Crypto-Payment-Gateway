# Crypto Payment Gateway - BSC USDT

Payment gateway untuk menerima pembayaran crypto menggunakan USDT di jaringan Binance Smart Chain (BSC) dengan integrasi Trust Wallet.

## Features

- ✅ Pembayaran USDT di jaringan BSC-20
- ✅ Generate QR Code untuk Trust Wallet
- ✅ Verifikasi transaksi otomatis
- ✅ Webhook untuk notifikasi pembayaran
- ✅ Rate limiting dan keamanan API
- ✅ Sistem API Key management
- ✅ Clean architecture dan error handling

## 📚 Dokumentasi

Untuk informasi lebih detail, silakan baca dokumentasi berikut:

- **[CHANGELOG.md](./CHANGELOG.md)** - Catatan perubahan dan update terbaru
- **[SANDBOX.md](./SANDBOX.md)** - Panduan lengkap mode sandbox untuk pengujian dan pengembangan
- **[EMAIL.md](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email
- **[example/](./example/)** - Contoh kode PHP untuk integrasi payment gateway

## Struktur Project

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

## Installation

1. Clone repository:
```bash
git clone https://github.com/Pendetot/Crypto-Payment-Gateway.git
cd Crypto-Payment-Gateway
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi yang sesuai
```

4. Start aplikasi:
```bash
npm run dev  # Development
npm start    # Production
```

## Environment Configuration

### Cara Mendapatkan Data Environment

#### 1. BSC RPC URL
**Mainnet:**
```
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
```

**Testnet (untuk testing):**
```
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

**Alternative RPC URLs:**
- `https://bsc-dataseed2.binance.org/`
- `https://bsc-dataseed3.binance.org/`
- `https://bsc-dataseed4.binance.org/`

#### 2. USDT Contract Address
**BSC Mainnet:**
```
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

**BSC Testnet:**
```
USDT_CONTRACT_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
```

Anda bisa verifikasi contract address di [BSCscan](https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955).

#### 3. Wallet Address & Private Key

**Cara 1: Menggunakan MetaMask/Trust Wallet**
1. Buka MetaMask atau Trust Wallet
2. Create new wallet atau gunakan existing wallet
3. Copy alamat wallet untuk `WALLET_ADDRESS`
4. Export private key untuk `WALLET_PRIVATE_KEY`

**Cara 2: Generate Wallet Secara Programatis**
```javascript
const { Web3 } = require('web3');
const web3 = new Web3();

// Generate new account
const account = web3.eth.accounts.create();
console.log('Address:', account.address);
console.log('Private Key:', account.privateKey);
```

**⚠️ PENTING:** 
- Jangan pernah share private key dengan siapapun
- Gunakan wallet terpisah khusus untuk payment gateway
- Pastikan wallet memiliki saldo BNB untuk gas fees

#### 4. API Keys dan Secrets

**API_KEY:** Akan di-generate otomatis jika tidak diset. Anda juga bisa generate manual:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**WEBHOOK_SECRET:** Generate secret key untuk webhook validation:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**JWT_SECRET:** Generate JWT secret (opsional untuk future features):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 5. Database Configuration (Opsional)

**MongoDB:** Jika menggunakan MongoDB untuk persistent storage:
```
MONGODB_URI=mongodb://localhost:27017/crypto_payment
# Atau MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/crypto_payment
```

**Redis:** Untuk caching dan session management:
```
REDIS_URL=redis://localhost:6379
# Atau Redis Cloud: redis://username:password@redis-server:port
```

### Complete Environment Variables

| Variable | Description | Required | Default | How to Get |
|----------|-------------|----------|---------|------------|
| `PORT` | Port aplikasi | No | 3000 | Pilih port yang available |
| `NODE_ENV` | Environment mode | No | development | `development`, `production`, `test` |
| `BSC_RPC_URL` | RPC URL BSC Mainnet | Yes | - | Gunakan public RPC atau [Ankr](https://www.ankr.com/rpc/bsc/), [QuickNode](https://www.quicknode.com/) |
| `USDT_CONTRACT_ADDRESS` | Contract address USDT BSC | Yes | - | Lihat di BSCscan |
| `WALLET_ADDRESS` | Alamat wallet penerima | Yes | - | Generate dari MetaMask/Trust Wallet |
| `WALLET_PRIVATE_KEY` | Private key wallet | Yes | - | Export dari wallet (tanpa 0x prefix) |
| `API_KEY` | API key untuk autentikasi | No | Auto-generated | Generate dengan crypto.randomBytes |
| `WEBHOOK_SECRET` | Secret key untuk webhook | Yes | - | Generate dengan crypto.randomBytes |
| `JWT_SECRET` | JWT secret key | No | - | Generate dengan crypto.randomBytes |
| `PAYMENT_TIMEOUT` | Timeout pembayaran (detik) | No | 1800 | 1800 = 30 menit |
| `MIN_CONFIRMATIONS` | Minimum konfirmasi | No | 12 | 12-20 untuk keamanan optimal |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | No | 900000 | 900000 = 15 menit |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 | Sesuai kebutuhan |
| `MONGODB_URI` | MongoDB connection string | No | - | MongoDB Atlas atau local |
| `REDIS_URL` | Redis connection URL | No | - | Redis Cloud atau local |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | * | Domain yang diizinkan akses |

### Example .env File

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Blockchain Configuration
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Wallet Configuration
WALLET_ADDRESS=0x1234567890123456789012345678901234567890
WALLET_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Security Configuration
API_KEY=your_generated_api_key_here
WEBHOOK_SECRET=your_generated_webhook_secret_here
JWT_SECRET=your_generated_jwt_secret_here

# Payment Configuration
PAYMENT_TIMEOUT=1800
MIN_CONFIRMATIONS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/crypto_payment
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=*

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
```

## API Documentation

### Authentication

Semua endpoint memerlukan API key di header:
```
X-API-Key: your-api-key-here
```

### Endpoints

#### 1. Create Payment
```http
POST /api/payment/create
Content-Type: application/json
X-API-Key: your-api-key

{
  "amount": 100.50,
  "orderId": "ORDER-123",
  "metadata": {
    "customer_email": "customer@example.com",
    "product_name": "Premium Package"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_1234567890",
    "amount": 100.50,
    "amountUSDT": "100.500000",
    "walletAddress": "0x1234...5678",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "trustWalletUrl": "https://link.trustwallet.com/send?coin=20000714&address=0x1234...5678&amount=100500000000000000000",
    "expiresAt": "2024-12-19T10:30:00.000Z",
    "status": "pending"
  }
}
```

#### 2. Check Payment Status
```http
GET /api/payment/status/:paymentId
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_1234567890",
    "status": "completed",
    "amount": 100.50,
    "amountUSDT": "100.500000",
    "transactionHash": "0xabcd...1234",
    "confirmations": 15,
    "createdAt": "2024-12-19T10:00:00.000Z",
    "completedAt": "2024-12-19T10:15:00.000Z"
  }
}
```

#### 3. Webhook Configuration
```http
POST /api/webhook/configure
Content-Type: application/json
X-API-Key: your-api-key

{
  "url": "https://yoursite.com/webhook",
  "events": ["payment.completed", "payment.expired", "payment.failed"]
}
```

### Webhook Events

Webhook akan mengirim POST request ke URL yang dikonfigurasi:

```json
{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay_1234567890",
    "orderId": "ORDER-123",
    "amount": 100.50,
    "amountUSDT": "100.500000",
    "transactionHash": "0xabcd...1234",
    "status": "completed",
    "metadata": {
      "customer_email": "customer@example.com"
    }
  },
  "timestamp": "2024-12-19T10:15:00.000Z",
  "signature": "sha256=abcd1234..."
}
```

## Security

### API Key Management
- API key di-generate otomatis saat startup jika belum ada
- Gunakan environment variable untuk menyimpan API key
- Rotate API key secara berkala

### Webhook Security
- Semua webhook request di-sign dengan HMAC-SHA256
- Verifikasi signature sebelum memproses webhook
- Gunakan HTTPS untuk webhook URL

### Rate Limiting
- Default: 100 requests per 15 menit per IP
- Dapat dikonfigurasi via environment variables
- Rate limit berlaku per endpoint

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing dengan cURL

**Create Payment:**
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "amount": 10.50,
    "orderId": "TEST-001"
  }'
```

**Check Status:**
```bash
curl -X GET http://localhost:3000/api/payment/status/pay_1234567890 \
  -H "X-API-Key: your-api-key"
```

## Troubleshooting

### Common Issues

#### 1. "Invalid API Key"
- Pastikan API key benar di environment variable
- Check header `X-API-Key` di request

#### 2. "RPC Error"
- Pastikan BSC_RPC_URL dapat diakses
- Coba gunakan RPC URL alternatif
- Check koneksi internet

#### 3. "Insufficient Gas"
- Pastikan wallet memiliki saldo BNB untuk gas fees
- Minimum 0.001 BNB direkomendasikan

#### 4. "Payment Not Found"
- Check payment ID benar
- Payment mungkin sudah expired (default 30 menit)

#### 5. "Webhook Not Received"
- Pastikan webhook URL dapat diakses dari internet
- Check firewall dan port configuration
- Verifikasi webhook signature

### Logs

Check application logs untuk debugging:
```bash
# Development
npm run dev

# Production dengan PM2
pm2 logs crypto-payment-gateway
```

## Production Deployment

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name crypto-payment-gateway

# Monitor
pm2 monit

# Logs
pm2 logs crypto-payment-gateway
```

### Using Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Setup
- Gunakan HTTPS di production
- Setup reverse proxy (Nginx/Apache)
- Configure firewall rules
- Setup monitoring dan alerting
- Regular backup untuk database

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit Pull Request

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## Support

- 📧 Email: support@yourcompany.com
- 💬 Discord: [Join our server](https://discord.gg/yourserver)
- 📖 Documentation: [docs.yourcompany.com](https://docs.yourcompany.com)
- 🐛 Issues: [GitHub Issues](https://github.com/Pendetot/Crypto-Payment-Gateway/issues)

## Changelog

Untuk melihat riwayat perubahan lengkap, baca [CHANGELOG.md](./CHANGELOG.md).
