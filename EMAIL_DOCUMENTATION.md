# 📧 Email Notification System

## Overview
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

#### Mode Production
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

### API Endpoints

#### 1. Status Email Service
```bash
GET /api/email/status
Headers: X-API-Key: your-api-key
```

#### 2. Test Email
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
- **Responsive Design**: Kompatibel dengan semua email client
- **Professional Layout**: Design modern dan clean
- **Brand Consistency**: Konsisten dengan identitas brand
- **Sandbox Indicators**: Visual indicator untuk mode testing
- **Multi-language Support**: Siap untuk internationalization

### Struktur Template
- Header dengan logo dan judul
- Konten utama dengan informasi pembayaran
- Call-to-action buttons
- Footer dengan informasi kontak
- Responsive untuk mobile dan desktop

## 🔧 Integrasi dengan Payment Flow

### Automatic Triggers
Email dapat dipicu otomatis pada event berikut:
1. **Payment Created**: Saat pembayaran baru dibuat
2. **Payment Verified**: Saat pembayaran berhasil diverifikasi
3. **Payment Expired**: Saat pembayaran melewati batas waktu

### Manual Triggers
Email juga dapat dipicu manual melalui API untuk:
- Testing dan debugging
- Resend notifications
- Custom scenarios

## 🛡️ Security & Privacy

### Data Protection
- Email addresses tidak disimpan permanen
- Enkripsi data sensitif dalam transit
- Rate limiting untuk mencegah spam
- Validasi input yang ketat

### Authentication
- API key required untuk semua endpoints
- Permission-based access control
- Audit logging untuk tracking

## 📊 Monitoring & Analytics

### Logging
- Email delivery status
- Error tracking dan debugging
- Performance metrics
- User engagement tracking

### Error Handling
- Graceful fallback untuk SMTP failures
- Retry mechanism untuk failed deliveries
- Detailed error reporting
- Health check endpoints

## 🚀 Deployment

### Production Setup
1. Configure SMTP credentials
2. Set up proper DNS records (SPF, DKIM)
3. Configure rate limiting
4. Set up monitoring and alerts

### Testing Setup
1. Use Ethereal Email for development
2. Test all email templates
3. Verify responsive design
4. Test error scenarios

## 📈 Future Enhancements

### Planned Features
- Email template customization
- Multi-language support
- Advanced analytics dashboard
- Webhook integration
- Bulk email capabilities
- A/B testing for templates

### Integration Opportunities
- CRM system integration
- Marketing automation
- Customer support ticketing
- Analytics platforms
- Mobile push notifications

## 🆘 Troubleshooting

### Common Issues
1. **SMTP Authentication Failed**
   - Verify credentials
   - Check app password settings
   - Ensure 2FA is configured

2. **Emails Not Delivered**
   - Check spam folders
   - Verify DNS records
   - Monitor delivery logs

3. **Template Rendering Issues**
   - Test with different email clients
   - Validate HTML structure
   - Check CSS compatibility

### Support
Untuk bantuan teknis, hubungi tim development atau buat issue di repository GitHub.
