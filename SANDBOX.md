# Sandbox Mode

The Crypto Payment Gateway includes a comprehensive sandbox mode for safe testing and development without using real cryptocurrency transactions.

## Features

- **Mock Payment Processing**: Create and manage payments without real blockchain transactions
- **Simulated Transaction Verification**: Test payment verification with mock transaction hashes
- **Safe Testing Environment**: No risk of losing real funds during development
- **Sandbox-Specific Endpoints**: Additional API endpoints for testing scenarios
- **Visual Indicators**: Orange QR codes and clear sandbox labeling

## Getting Started

### Enable Sandbox Mode

Set one of the following environment variables:

```bash
# Option 1: Set NODE_ENV to sandbox
NODE_ENV=sandbox

# Option 2: Use SANDBOX_MODE flag
SANDBOX_MODE=true

# Option 3: Set ENVIRONMENT variable
ENVIRONMENT=sandbox
```

### Running in Sandbox Mode

```bash
# Start in sandbox mode
npm run sandbox

# Development mode with auto-reload
npm run sandbox:dev
```

## Sandbox vs Production

| Feature | Production | Sandbox |
|---------|------------|---------|
| Blockchain | BSC Mainnet | Mock/Simulated |
| Transactions | Real USDT | Simulated |
| Wallet | Real wallet address | Mock wallet |
| QR Codes | Black | Orange (visual indicator) |
| Payment Timeout | Configurable | 30 minutes |
| Confirmations | Real blockchain | Simulated (3 confirmations) |

## API Endpoints

### Sandbox-Specific Endpoints

All sandbox endpoints are only available when running in sandbox mode.

#### Get Sandbox Information
```http
GET /api/sandbox/info
```

Returns sandbox environment details and statistics.

#### Simulate Payment
```http
POST /api/sandbox/simulate/{paymentId}
```

Automatically completes a payment with a mock transaction.

#### Create Test Payment
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

#### Get All Sandbox Payments
```http
GET /api/sandbox/payments
X-API-Key: admin-api-key
```

#### Clear All Sandbox Data
```http
DELETE /api/sandbox/payments
X-API-Key: admin-api-key
```

#### Get Sandbox Statistics
```http
GET /api/sandbox/stats
X-API-Key: your-api-key
```

## Testing Workflow

### 1. Create a Test Payment

```bash
curl -X POST http://localhost:3000/api/payment/create   -H "Content-Type: application/json"   -H "X-API-Key: your-api-key"   -d '{
    "amount": 25.50,
    "orderId": "TEST-ORDER-123"
  }'
```

### 2. Simulate Payment Completion

```bash
curl -X POST http://localhost:3000/api/sandbox/simulate/{paymentId}   -H "X-API-Key: your-api-key"
```

### 3. Check Payment Status

```bash
curl -X GET http://localhost:3000/api/payment/status/{paymentId}   -H "X-API-Key: your-api-key"
```

## Environment Detection

The application automatically detects sandbox mode and displays appropriate indicators:

- **Health Check**: `/health` endpoint shows current environment
- **API Documentation**: `/api/docs` includes sandbox endpoints when active
- **Console Output**: Clear indication of sandbox vs production mode
- **QR Codes**: Orange color scheme for sandbox payments

## Mock Data

### Sandbox Wallet Address
```
0x742d35Cc6634C0532925a3b8D4C9db96590c0000
```

### Mock Transaction Hashes
Sandbox generates realistic-looking transaction hashes:
```
0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Mock Balances
- **BNB**: Random balance between 1-11 BNB
- **USDT**: Random balance between 100-1100 USDT

## Best Practices

1. **Always Use Sandbox for Development**: Never test with real funds
2. **Clear Sandbox Data**: Use `DELETE /api/sandbox/payments` between test sessions
3. **Monitor Sandbox Stats**: Use `/api/sandbox/stats` to track test progress
4. **Test Different Scenarios**: Use various amounts and order IDs
5. **Verify Environment**: Check `/health` endpoint to confirm sandbox mode

## Troubleshooting

### Sandbox Endpoints Return 403
- Ensure `NODE_ENV=sandbox` or `SANDBOX_MODE=true` is set
- Restart the application after changing environment variables

### Mock Transactions Not Working
- Verify you're using sandbox-specific endpoints
- Check that payment exists and is in "pending" status

### QR Codes Still Black
- Confirm sandbox mode is active via `/api/sandbox/info`
- Clear browser cache if testing in browser

## Security Notes

- Sandbox mode is for development only
- Never use sandbox configuration in production
- Sandbox data is stored in memory and will be lost on restart
- Mock transactions have no real blockchain validation

## Integration Testing

```javascript
// Example test using sandbox mode
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

// Simulate payment completion
await fetch(`/api/sandbox/simulate/${paymentId}`, {
  method: 'POST',
  headers: { 'X-API-Key': 'test-key' }
});

// Verify payment status
const status = await fetch(`/api/payment/status/${paymentId}`, {
  headers: { 'X-API-Key': 'test-key' }
});
```
