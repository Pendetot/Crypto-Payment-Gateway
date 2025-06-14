const productionPaymentService = require('./paymentService');
const sandboxPaymentService = require('./sandboxPaymentService');

class PaymentServiceFactory {
  static getPaymentService() {
    const isSandboxMode = process.env.NODE_ENV === 'sandbox' || 
                         process.env.SANDBOX_MODE === 'true' ||
                         process.env.ENVIRONMENT === 'sandbox';
    
    if (isSandboxMode) {
      console.log('🏖️  Using Sandbox Payment Service');
      return sandboxPaymentService;
    } else {
      console.log('🚀 Using Production Payment Service');
      return productionPaymentService;
    }
  }

  static isSandboxMode() {
    return process.env.NODE_ENV === 'sandbox' || 
           process.env.SANDBOX_MODE === 'true' ||
           process.env.ENVIRONMENT === 'sandbox';
  }

  static getEnvironmentInfo() {
    const isSandbox = this.isSandboxMode();
    return {
      environment: isSandbox ? 'sandbox' : 'production',
      isSandbox,
      serviceType: isSandbox ? 'Mock Payment Service' : 'Real Payment Service',
      network: isSandbox ? 'BSC Testnet' : 'BSC Mainnet',
      description: isSandbox 
        ? 'Safe testing environment with mock transactions'
        : 'Live environment with real blockchain transactions'
    };
  }
}

module.exports = PaymentServiceFactory;
