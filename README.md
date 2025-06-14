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

- **[SANDBOX](./SANDBOX.md)** - Panduan lengkap mode sandbox untuk pengujian dan pengembangan
- **[EMAIL DOCUMENTATION](./EMAIL_DOCUMENTATION.md)** - Dokumentasi sistem notifikasi email

## Struktur Project

```
crypto-payment-gateway/
├── src/
│   ├── routes/
│   │   ├── payment.js      # Payment endpoints
│   │   ├── webhook.js      # Webhook handlers
│   │   └── apiKeys.js      # API key management
│   ├── services/
│   │   └── paymentService.js  # Core payment logic
│   ├── validators/
│   │   └── paymentValidator.js  # Input validation
│   ├── middleware/
│   │   ├── auth.js         # Authentication & authorization
│   │   └── errorHandler.js # Error handling
│   └── app.js              # Main application
├── .env.example            # Environment template
├── package.json
├── README.md               # Dokumentasi utama
├── SANDBOX.md              # Dokumentasi mode sandbox
└── EMAIL_DOCUMENTATION.md  # Dokumentasi sistem email
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
WALLET_PRIVATE_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# Security
API_KEY=def456789012345678901234567890123456789012345678901234567890abc
WEBHOOK_SECRET=fed654321098765432109876543210987654321098765432109876543210
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef

# Payment Settings
PAYMENT_TIMEOUT=1800
MIN_CONFIRMATIONS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (optional)
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/crypto_payment
REDIS_URL=redis://localhost:6379
```

## API Endpoints

### Authentication

Semua endpoint (kecuali `/health` dan `/api/docs`) memerlukan API key authentication:

**Headers:**
```
X-API-Key: your_api_key
# atau
Authorization: Bearer your_api_key
```

### 1. Create Payment

**POST** `/api/payment/create`

Headers:
```
X-API-Key: your_api_key
Content-Type: application/json
```

Body:
```json
{
  "amount": 100.50,
  "orderId": "ORDER123",
  "metadata": {
    "customerId": "CUST001",
    "productName": "Premium Package"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-here",
    "originalAmount": "100.50",
    "amount": "100.73",
    "walletAddress": "0x...",
    "trustWalletUrl": "trust://send?...",
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2025-06-08T12:00:00.000Z",
    "network": "BSC",
    "token": "USDT",
    "note": "Please pay exactly 100.73 USDT (100.50 + unique identifier)",
    "instructions": [
      "1. Send exactly 100.73 USDT to the provided wallet address",
      "2. Use BSC (Binance Smart Chain) network",
      "3. Payment expires at 2025-06-08T12:00:00.000Z",
      "4. You can scan the QR code with Trust Wallet for easy payment"
    ]
  }
}
```

### 2. Verify Payment

**POST** `/api/payment/verify`

Headers:
```
X-API-Key: your_api_key
Content-Type: application/json
```

Body:
```json
{
  "paymentId": "uuid-here",
  "txHash": "0x..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-here",
    "originalAmount": "100.50",
    "paidAmount": "100.73",
    "status": "confirmed",
    "txHash": "0x...",
    "confirmations": 15,
    "verifiedAt": "2025-06-08T12:00:00.000Z",
    "message": "Payment confirmed successfully"
  }
}
```

### 3. Check Payment Status

**GET** `/api/payment/status/:paymentId`

Headers:
```
X-API-Key: your_api_key
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-here",
    "status": "pending",
    "originalAmount": "100.50",
    "amount": "100.73",
    "orderId": "ORDER123",
    "createdAt": "2025-06-08T11:30:00.000Z",
    "expiresAt": "2025-06-08T12:00:00.000Z",
    "txHash": null,
    "confirmations": 0,
    "network": "BSC",
    "token": "USDT"
  }
}
```

### 4. Check Wallet Balance

**GET** `/api/payment/balance`

Headers:
```
X-API-Key: your_api_key
```

Response:
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "balances": {
      "BNB": {
        "amount": "1.234",
        "symbol": "BNB",
        "name": "Binance Coin"
      },
      "USDT": {
        "amount": "5000.123456",
        "symbol": "USDT",
        "name": "Tether USD",
        "contractAddress": "0x55d398326f99059fF775485246999027B3197955"
      }
    },
    "network": "BSC (Binance Smart Chain)",
    "lastUpdated": "2025-06-08T12:00:00.000Z"
  }
}
```

### 5. List Payments (Admin Only)

**GET** `/api/payment/list`

Headers:
```
X-API-Key: admin_api_key
```

Query Parameters:
- `status`: Filter by status (`pending`, `confirmed`, `expired`)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

Response:
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## API Key Management

### 1. Create API Key (Admin Only)

**POST** `/api/keys/create`

Headers:
```
X-API-Key: admin_api_key
Content-Type: application/json
```

Body:
```json
{
  "name": "Mobile App Key",
  "permissions": ["payment:create", "payment:verify", "payment:status"]
}
```

Available permissions:
- `payment:create` - Create new payments
- `payment:verify` - Verify payments
- `payment:status` - Check payment status
- `payment:balance` - View wallet balance
- `admin` - Full access to all endpoints

### 2. List API Keys (Admin Only)

**GET** `/api/keys/list`

### 3. Revoke API Key (Admin Only)

**POST** `/api/keys/revoke`

Body:
```json
{
  "apiKey": "api_key_to_revoke"
}
```

### 4. Get Current API Key Info

**GET** `/api/keys/info`

## Payment Flow

1. **Create Payment**: Client membuat payment request dengan amount unik
2. **Generate QR**: System generate QR code untuk Trust Wallet
3. **User Payment**: User scan QR atau buka Trust Wallet URL
4. **Transaction**: User mengirim USDT dengan amount unik ke wallet address
5. **Auto-Detection**: System otomatis detect transaksi masuk via webhook
6. **Verification**: System verifikasi transaksi di blockchain
7. **Confirmation**: Payment dikonfirmasi setelah minimum confirmations
8. **Webhook**: Notifikasi dikirim ke webhook endpoint (opsional)

## Unique Amount System

Untuk menghindari konflik pembayaran, system menggunakan **unique amount**:
- Original amount: `$100.00`
- Unique amount: `$100.73` (ditambah random cents)
- User harus bayar exact amount: `100.73 USDT`

## Payment Status

- `pending`: Pembayaran baru dibuat, menunggu transaksi
- `pending_confirmation`: Transaksi ditemukan, menunggu konfirmasi
- `confirmed`: Pembayaran terkonfirmasi dengan cukup konfirmasi
- `expired`: Pembayaran expired (timeout)

## Webhook Integration

Webhook akan mengirim notifikasi ke endpoint yang Anda tentukan ketika status pembayaran berubah.

### Webhook Endpoints

#### 1. Payment Confirmed
**POST** `/api/webhook/payment-confirmed`

Headers:
```
X-Webhook-Signature: sha256_signature
Content-Type: application/json
```

Body:
```json
{
  "paymentId": "uuid-here",
  "txHash": "0x...",
  "confirmations": 12
}
```

#### 2. Transaction Notification
**POST** `/api/webhook/transaction-notification`

Body:
```json
{
  "txHash": "0x...",
  "toAddress": "0x...",
  "amount": 100.73,
  "token": "0x..."
}
```

### Webhook Security

Semua webhook request menggunakan signature verification dengan HMAC SHA256. Verifikasi signature di endpoint Anda:

```javascript
const crypto = require('crypto');

function verifySignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## Trust Wallet Integration

### QR Code Format
QR code berisi Trust Wallet deep link dengan format:
```
trust://send?address=0x...&amount=100.73&token=0x...&memo=paymentId
```

### Manual Transfer
User juga bisa transfer manual dengan informasi:
- **Network**: Binance Smart Chain (BSC)
- **Token**: USDT (BSC-20)
- **Address**: Wallet address dari response
- **Amount**: Jumlah exact dari response (termasuk unique cents)
- **Memo**: Payment ID (opsional)

## Security Best Practices

1. **API Key**: Gunakan API key yang strong dan unique
2. **HTTPS**: Selalu gunakan HTTPS di production  
3. **Rate Limiting**: Sudah diimplementasi (100 req/15 menit per IP)
4. **API Key Rate Limiting**: Rate limiting per API key
5. **Input Validation**: Semua input divalidasi dengan Joi
6. **Private Key**: Jangan expose private key di logs
7. **Webhook Secret**: Gunakan secret yang strong untuk webhook
8. **Permission System**: API keys dengan permission-based access
9. **CORS**: Configure allowed origins untuk security
10. **Helmet**: Security headers dengan Helmet.js

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid API key)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (payment/resource not found)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Monitoring & Logging

### Health Check
**GET** `/health`

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-06-08T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### API Documentation
**GET** `/api/docs`

Menampilkan dokumentasi API lengkap dengan semua endpoints dan permissions.

### Authentication Test
**GET** `/api/auth/test`

Test endpoint untuk verifikasi API key:
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "keyName": "Default Admin Key",
    "permissions": ["admin", "payment:create", "payment:verify", "payment:status", "payment:balance"],
    "lastUsed": "2025-06-08T12:00:00.000Z"
  }
}
```

### Logs
- Request/response logs dengan Morgan
- Payment status changes
- Transaction verifications  
- Error logs dengan stack trace
- API key usage tracking

## Production Deployment

### 1. Environment Setup
```bash
NODE_ENV=production
PORT=3000
```

### 2. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start app.js --name "crypto-payment"
pm2 startup
pm2 save
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. SSL Certificate
```bash
certbot --nginx -d your-domain.com
```

### 5. Firewall Setup
```bash
# UFW
ufw allow 22/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
ufw enable

# Fail2ban untuk protection
apt install fail2ban
```

## Testing

### Manual Testing dengan cURL

1. **Test Authentication**:
```bash
curl -X GET http://localhost:3000/api/auth/test \
  -H "X-API-Key: your_api_key"
```

2. **Create Payment**:
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.5,
    "orderId": "TEST001",
    "metadata": {"test": true}
  }'
```

3. **Check Status**:
```bash
curl -X GET http://localhost:3000/api/payment/status/PAYMENT_ID \
  -H "X-API-Key: your_api_key"
```

4. **Check Balance**:
```bash
curl -X GET http://localhost:3000/api/payment/balance \
  -H "X-API-Key: your_api_key"
```

5. **Create API Key**:
```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "X-API-Key: admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "permissions": ["payment:create", "payment:status"]
  }'
```

## Network Configuration

### BSC Mainnet Configuration
```env
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
MIN_CONFIRMATIONS=12
```

### BSC Testnet Configuration (untuk testing)
```env  
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
USDT_CONTRACT_ADDRESS=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
MIN_CONFIRMATIONS=3
```

## Troubleshooting

### Common Issues

1. **"API key required"**
   - Pastikan header `X-API-Key` atau `Authorization: Bearer` ada
   - Cek apakah API key valid dan aktif
   - Use `/api/auth/test` untuk test authentication

2. **"Transaction not found"**
   - Pastikan RPC URL benar dan accessible
   - Cek apakah transaksi sudah di-broadcast ke network
   - Tunggu beberapa block confirmation
   - Pastikan menggunakan BSC network, bukan Ethereum

3. **"Invalid transaction"**
   - Pastikan amount exact sesuai dengan unique amount
   - Cek contract address USDT BSC
   - Pastikan menggunakan BSC network
   - Pastikan wallet address tujuan benar

4. **"Payment not found"**
   - Cek paymentId yang digunakan (harus UUID format)
   - Payment mungkin sudah expired
   - Restart aplikasi jika menggunakan memory storage
   - Cek permission API key untuk akses payment

5. **"Rate limit exceeded"**
   - Kurangi frequency request
   - Implementasi exponential backoff
   - Check rate limit settings di environment
   - Gunakan API key berbeda jika memungkinkan

6. **"Insufficient permissions"**
   - Cek permission API key dengan `/api/keys/info`
   - Gunakan admin API key untuk admin endpoints
   - Request permission baru dari admin

7. **"Wallet balance issues"**
   - Pastikan wallet memiliki BNB untuk gas fees
   - Cek network connectivity ke BSC RPC
   - Verifikasi wallet address dan private key

### Debug Mode
Set environment variable untuk debug:
```env
NODE_ENV=development
DEBUG=*
```

### RPC Issues
Jika RPC bermasalah, coba alternative:
```env
# Primary
BSC_RPC_URL=https://bsc-dataseed1.binance.org/

# Alternatives
BSC_RPC_URL=https://bsc-dataseed2.binance.org/
BSC_RPC_URL=https://bsc-dataseed3.binance.org/
BSC_RPC_URL=https://rpc.ankr.com/bsc
```

### Memory vs Persistent Storage
Aplikasi menggunakan in-memory storage. Untuk production, pertimbangkan:
- MongoDB untuk persistent payment storage
- Redis untuk caching dan session management
- Regular backup unique amounts

## Performance Optimization

### 1. Rate Limiting
- Global rate limiting: 200 req/15 min per IP
- API key rate limiting: 100 req/15 min per key
- Adjustable via environment variables

### 2. Caching
- Payment data cached in memory
- Wallet balance caching (consider Redis)
- QR code generation caching

### 3. Database Optimization
- Index payment IDs dan status
- Cleanup expired payments
- Archive confirmed payments

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test on both mainnet dan testnet

## License

MIT License - lihat file LICENSE untuk detail lengkap.

## Support

Untuk support dan pertanyaan:
- Create issue di GitHub repository
- Instagram: @AOL_RA

---

**⚠️ Security Note:** Pastikan untuk:
- Tidak pernah commit file `.env` ke repository
- Gunakan strong passwords dan secrets
- Regular update dependencies
- Monitor logs untuk suspicious activities
- Backup private keys secara aman
