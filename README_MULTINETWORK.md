# Multi-Network Crypto Payment Gateway

A comprehensive cryptocurrency payment gateway supporting multiple blockchain networks including Binance Smart Chain (BSC), Ethereum, and Solana.

## 🌐 Supported Networks

### Binance Smart Chain (BSC)
- **Mainnet**: BSC Mainnet
- **Testnet**: BSC Testnet
- **Native Currency**: BNB
- **Supported Tokens**: USDT, USDC, BUSD

### Ethereum
- **Mainnet**: Ethereum Mainnet
- **Testnet**: Sepolia Testnet
- **Native Currency**: ETH
- **Supported Tokens**: USDT, USDC, DAI

### Solana
- **Mainnet**: Solana Mainnet-Beta
- **Testnet**: Solana Devnet
- **Native Currency**: SOL
- **Supported Tokens**: USDT, USDC

## 🚀 New Features

### Multi-Network Support
- Create payments on any supported network
- Automatic network detection and validation
- Network-specific transaction hash validation
- Cross-network payment management

### Enhanced Payment Creation
```javascript
// Create BSC USDT payment (default)
POST /api/payment/create
{
  "amount": 100,
  "orderId": "ORDER123"
}

// Create Ethereum USDC payment
POST /api/payment/create
{
  "amount": 100,
  "orderId": "ORDER123",
  "network": "ETH",
  "token": "USDC"
}

// Create Solana SOL payment
POST /api/payment/create
{
  "amount": 1.5,
  "orderId": "ORDER123",
  "network": "SOL",
  "token": "SOL"
}
```

### Network Information Endpoint
```javascript
GET /api/payment/networks
```
Returns supported networks, tokens, and environment information.

### Enhanced Balance Checking
```javascript
// Get BSC balances
GET /api/payment/balance?network=BSC

// Get Ethereum balances
GET /api/payment/balance?network=ETH

// Get Solana balances
GET /api/payment/balance?network=SOL
```

## 🔧 Configuration

### Environment Variables

#### Network-Specific Wallet Addresses
```env
# BSC Wallet
BSC_WALLET_ADDRESS=0x...
WALLET_ADDRESS=0x...  # Fallback for BSC

# Ethereum Wallet
ETH_WALLET_ADDRESS=0x...

# Solana Wallet
SOL_WALLET_ADDRESS=...
```

#### RPC Endpoints
```env
# BSC
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Ethereum
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
ETH_TESTNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Solana
SOL_RPC_URL=https://api.mainnet-beta.solana.com
SOL_TESTNET_RPC_URL=https://api.devnet.solana.com
```

#### Network Mode
```env
# Environment modes
NODE_ENV=production          # Use mainnet
NODE_ENV=development         # Use testnet
USE_TESTNET=true            # Force testnet
SANDBOX_MODE=true           # Use sandbox mode
```

## 📝 API Examples

### Create Multi-Network Payments

#### BSC USDT Payment
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "orderId": "BSC001",
    "network": "BSC",
    "token": "USDT"
  }'
```

#### Ethereum USDC Payment
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "orderId": "ETH001",
    "network": "ETH",
    "token": "USDC"
  }'
```

#### Solana SOL Payment
```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1.5,
    "orderId": "SOL001",
    "network": "SOL",
    "token": "SOL"
  }'
```

### Verify Payments

#### EVM Networks (BSC, Ethereum)
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment-uuid",
    "txHash": "0x1234567890abcdef...",
    "network": "ETH"
  }'
```

#### Solana Network
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment-uuid",
    "txHash": "5J7XqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqW",
    "network": "SOL"
  }'
```

## 🏗️ Architecture

### Service Structure
```
src/services/
├── paymentServiceFactory.js     # Factory for creating network-specific services
├── bscPaymentService.js         # BSC payment handling
├── ethereumPaymentService.js    # Ethereum payment handling
├── solanaPaymentService.js      # Solana payment handling
├── sandboxPaymentService.js     # Sandbox/testing service
└── databaseService.js           # Database operations
```

### Network Configuration
```
src/config/
└── networks.js                  # Network configurations and validation
```

### Validation
```
src/validators/
└── paymentValidator.js          # Multi-network validation schemas
```

## 🔍 Transaction Hash Formats

### EVM Networks (BSC, Ethereum)
- Format: `0x` followed by 64 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Solana
- Format: Base58 encoded string, typically 87-88 characters
- Example: `5J7XqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqWqW`

## 🔐 Address Formats

### EVM Networks (BSC, Ethereum)
- Format: `0x` followed by 40 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef12345678`

### Solana
- Format: Base58 encoded string, typically 32-44 characters
- Example: `11111111111111111111111111111112`

## 🧪 Testing

### Testnet Configuration
Set `NODE_ENV=development` or `USE_TESTNET=true` to use testnets:
- BSC Testnet
- Ethereum Sepolia
- Solana Devnet

### Sandbox Mode
Set `SANDBOX_MODE=true` for complete mock testing without real blockchain interactions.

## 📊 Database Schema

The database automatically handles multi-network payments with these key fields:
- `network`: Network identifier (BSC, ETH, SOL)
- `token`: Token symbol (USDT, USDC, SOL, etc.)
- `contract_address`: Token contract address (null for native currencies)
- `wallet_address`: Receiving wallet address
- `tx_hash`: Transaction hash (network-specific format)

## 🚨 Error Handling

### Network Validation Errors
- Unsupported network
- Invalid token for network
- Invalid transaction hash format
- Invalid address format

### Payment Errors
- Network mismatch
- Insufficient balance
- Transaction not found
- Invalid transaction amount

## 🔄 Migration from Single Network

If upgrading from the single-network version:

1. **Environment Variables**: Add network-specific wallet addresses and RPC URLs
2. **API Calls**: Update to include `network` and `token` parameters
3. **Transaction Verification**: Update to handle different hash formats
4. **Database**: Existing payments will work with default BSC network

## 📈 Monitoring

### Health Check
```bash
GET /health
```
Returns environment information including active networks.

### Network Status
```bash
GET /api/payment/networks
```
Returns all supported networks and their current status.

## 🛠️ Development

### Adding New Networks

1. Create network-specific service in `src/services/`
2. Add network configuration in `src/config/networks.js`
3. Update factory in `src/services/paymentServiceFactory.js`
4. Add validation rules in `src/validators/paymentValidator.js`

### Custom Token Support

Add token configurations in `src/config/networks.js`:
```javascript
tokens: {
  'CUSTOM': {
    address: '0x...',
    decimals: 18,
    name: 'Custom Token'
  }
}
```

## 📞 Support

For issues related to multi-network functionality:
1. Check network configuration
2. Verify wallet addresses for each network
3. Ensure RPC endpoints are accessible
4. Validate transaction hash formats
5. Check token contract addresses

## 🔮 Future Enhancements

- Polygon network support
- Avalanche network support
- Cross-chain payment routing
- Automatic token price conversion
- Multi-signature wallet support
- Layer 2 solutions integration
