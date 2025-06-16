const BSCPaymentService = require('./bscPaymentService');
const EthereumPaymentService = require('./ethereumPaymentService');
const SolanaPaymentService = require('./solanaPaymentService');
const sandboxPaymentService = require('./sandboxPaymentService');
const { validateNetworkAndToken } = require('../config/networks');

class PaymentServiceFactory {
  static getPaymentService(network = 'BSC', token = 'USDT') {
    const isSandboxMode = process.env.NODE_ENV === 'sandbox' || 
                         process.env.SANDBOX_MODE === 'true' ||
                         process.env.ENVIRONMENT === 'sandbox';
    
    if (isSandboxMode) {
      console.log('🏖️  Using Sandbox Payment Service');
      return sandboxPaymentService;
    }

    // Validate network and token
    validateNetworkAndToken(network, token);
    
    const isTestnet = process.env.NODE_ENV === 'development' || 
                     process.env.USE_TESTNET === 'true';
    
    switch (network.toUpperCase()) {
      case 'BSC':
        console.log(`🚀 Using BSC Payment Service (${isTestnet ? 'Testnet' : 'Mainnet'})`);
        return new BSCPaymentService(isTestnet);
        
      case 'ETH':
      case 'ETHEREUM':
        console.log(`🚀 Using Ethereum Payment Service (${isTestnet ? 'Testnet' : 'Mainnet'})`);
        return new EthereumPaymentService(isTestnet);
        
      case 'SOL':
      case 'SOLANA':
        console.log(`🚀 Using Solana Payment Service (${isTestnet ? 'Devnet' : 'Mainnet'})`);
        return new SolanaPaymentService(isTestnet);
        
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  static isSandboxMode() {
    return process.env.NODE_ENV === 'sandbox' || 
           process.env.SANDBOX_MODE === 'true' ||
           process.env.ENVIRONMENT === 'sandbox';
  }

  static isTestnetMode() {
    return process.env.NODE_ENV === 'development' || 
           process.env.USE_TESTNET === 'true';
  }

  static getEnvironmentInfo(network = 'BSC') {
    const isSandbox = this.isSandboxMode();
    const isTestnet = this.isTestnetMode();
    
    if (isSandbox) {
      return {
        environment: 'sandbox',
        isSandbox: true,
        isTestnet: false,
        serviceType: 'Mock Payment Service',
        network: 'All Networks (Mock)',
        description: 'Safe testing environment with mock transactions'
      };
    }
    
    const networkNames = {
      'BSC': isTestnet ? 'BSC Testnet' : 'BSC Mainnet',
      'ETH': isTestnet ? 'Ethereum Sepolia' : 'Ethereum Mainnet',
      'SOL': isTestnet ? 'Solana Devnet' : 'Solana Mainnet',
      'POLYGON': isTestnet ? 'Polygon Mumbai' : 'Polygon Mainnet'
    };
    
    return {
      environment: isTestnet ? 'testnet' : 'production',
      isSandbox: false,
      isTestnet,
      serviceType: 'Real Payment Service',
      network: networkNames[network.toUpperCase()] || `${network} ${isTestnet ? 'Testnet' : 'Mainnet'}`,
      description: isTestnet 
        ? 'Testing environment with real testnet transactions'
        : 'Live environment with real blockchain transactions'
    };
  }

  static getSupportedNetworks() {
    const { getSupportedNetworks } = require('../config/networks');
    return getSupportedNetworks();
  }

  static getSupportedTokens(network) {
    const { getSupportedTokens } = require('../config/networks');
    return getSupportedTokens(network);
  }
}

module.exports = PaymentServiceFactory;
