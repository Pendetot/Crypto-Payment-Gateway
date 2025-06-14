const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class SandboxPaymentService {
  constructor() {
    this.pendingPayments = new Map();
    this.usedUniqueAmounts = new Set();
    this.mockTransactions = new Map();
    
    // Sandbox configuration
    this.sandboxWallet = '0x742d35Cc6634C0532925a3b8D4C9db96590c0000'; // Mock wallet
    this.sandboxUSDTContract = '0x55d398326f99059fF775485246999027B3197955'; // BSC Testnet USDT
    this.network = 'BSC Testnet';
  }

  generateUniqueAmount(originalAmount) {
    let attempts = 0;
    let uniqueAmount;
    
    do {
      const randomCents = Math.floor(Math.random() * 99) + 1;
      const centsDecimal = randomCents / 100;
      
      uniqueAmount = parseFloat((originalAmount + centsDecimal).toFixed(2));
      attempts++;
      
      if (attempts > 50) {
        const timestamp = Date.now() % 100;
        uniqueAmount = parseFloat((originalAmount + (timestamp / 100)).toFixed(2));
        break;
      }
    } while (this.usedUniqueAmounts.has(uniqueAmount));
    
    this.usedUniqueAmounts.add(uniqueAmount);
    
    // Auto-cleanup after 1 hour in sandbox mode (faster than production)
    setTimeout(() => {
      this.usedUniqueAmounts.delete(uniqueAmount);
    }, 60 * 60 * 1000);
    
    return uniqueAmount;
  }

  async createPayment(amount, orderId, metadata = {}) {
    const paymentId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes in sandbox
    
    const uniqueAmount = this.generateUniqueAmount(parseFloat(amount));
    
    const paymentData = {
      id: paymentId,
      originalAmount: amount.toString(),
      amount: uniqueAmount.toString(),
      orderId,
      walletAddress: this.sandboxWallet,
      contractAddress: this.sandboxUSDTContract,
      network: this.network,
      token: 'USDT (Testnet)',
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      metadata: {
        ...metadata,
        sandboxMode: true,
        environment: 'sandbox'
      }
    };

    const trustWalletUrl = this.generateTrustWalletUrl(uniqueAmount, paymentId);
    const qrCode = await this.generateQRCode(trustWalletUrl);

    paymentData.trustWalletUrl = trustWalletUrl;
    paymentData.qrCode = qrCode;

    this.pendingPayments.set(paymentId, paymentData);
    
    // Auto-expire after 30 minutes
    setTimeout(() => {
      this.expirePayment(paymentId);
    }, 30 * 60 * 1000);

    return paymentData;
  }

  generateTrustWalletUrl(amount, paymentId) {
    const params = new URLSearchParams({
      address: this.sandboxWallet,
      amount: amount.toString(),
      token: this.sandboxUSDTContract,
      memo: `SANDBOX-${paymentId}`
    });
    
    return `trust://send?${params.toString()}`;
  }

  async generateQRCode(data) {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#FF6B35', // Orange color to indicate sandbox
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Mock transaction generation for testing
  generateMockTransaction(paymentId, amount) {
    const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const blockNumber = Math.floor(Math.random() * 1000000) + 20000000;
    
    const mockTx = {
      hash: txHash,
      blockNumber: blockNumber,
      from: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      to: this.sandboxUSDTContract,
      value: '0',
      input: '0xa9059cbb' + this.sandboxWallet.slice(2).padStart(64, '0') + 
             Math.floor(amount * 1000000).toString(16).padStart(64, '0'),
      status: true,
      confirmations: Math.floor(Math.random() * 10) + 1
    };
    
    this.mockTransactions.set(txHash, mockTx);
    return mockTx;
  }

  async verifyPayment(paymentId, txHash) {
    try {
      const payment = this.pendingPayments.get(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        throw new Error('Payment already processed');
      }

      // In sandbox mode, we can simulate different scenarios
      let transaction = this.mockTransactions.get(txHash);
      
      if (!transaction) {
        // Auto-generate a valid mock transaction if not exists
        transaction = this.generateMockTransaction(paymentId, parseFloat(payment.amount));
      }

      // Simulate validation
      const isValid = this.validateMockTransaction(transaction, payment);
      if (!isValid) {
        throw new Error('Invalid transaction (sandbox simulation)');
      }

      const confirmations = transaction.confirmations;
      
      payment.txHash = txHash;
      payment.confirmations = confirmations;
      payment.status = confirmations >= 3 ? 'confirmed' : 'pending_confirmation'; // Lower threshold for sandbox
      payment.verifiedAt = new Date();
      payment.metadata.sandboxTransaction = true;

      this.pendingPayments.set(paymentId, payment);
      
      return payment;
    } catch (error) {
      throw new Error(`Sandbox payment verification failed: ${error.message}`);
    }
  }

  validateMockTransaction(transaction, payment) {
    // Simulate transaction validation logic
    const expectedAmount = Math.floor(parseFloat(payment.amount) * 1000000); // Convert to wei equivalent
    const txAmount = parseInt(transaction.input.slice(-64), 16);
    
    return Math.abs(txAmount - expectedAmount) < 1000; // Allow small variance in sandbox
  }

  findPaymentByAmount(amount) {
    const numAmount = parseFloat(amount);
    
    for (const [paymentId, payment] of this.pendingPayments) {
      if (payment.status === 'pending' && 
          parseFloat(payment.amount) === numAmount) {
        return { paymentId, payment };
      }
    }
    return null;
  }

  async getConfirmations(txHash) {
    const transaction = this.mockTransactions.get(txHash);
    return transaction ? transaction.confirmations : Math.floor(Math.random() * 10) + 1;
  }

  getPayment(paymentId) {
    return this.pendingPayments.get(paymentId);
  }

  expirePayment(paymentId) {
    const payment = this.pendingPayments.get(paymentId);
    if (payment && payment.status === 'pending') {
      payment.status = 'expired';
      payment.metadata.expiredInSandbox = true;
      this.pendingPayments.set(paymentId, payment);
      
      this.usedUniqueAmounts.delete(parseFloat(payment.amount));
    }
  }

  async getWalletBalance() {
    // Return mock balance for sandbox
    return (Math.random() * 10 + 1).toFixed(4); // Random BNB balance between 1-11
  }

  async getUSDTBalance() {
    // Return mock USDT balance for sandbox
    return (Math.random() * 1000 + 100).toFixed(2); // Random USDT balance between 100-1100
  }

  // Sandbox-specific methods
  simulatePayment(paymentId) {
    const payment = this.getPayment(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const mockTx = this.generateMockTransaction(paymentId, parseFloat(payment.amount));
    return this.verifyPayment(paymentId, mockTx.hash);
  }

  getAllPayments() {
    return Array.from(this.pendingPayments.values());
  }

  clearAllPayments() {
    this.pendingPayments.clear();
    this.mockTransactions.clear();
    this.usedUniqueAmounts.clear();
  }

  getSandboxStats() {
    const payments = Array.from(this.pendingPayments.values());
    return {
      totalPayments: payments.length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      confirmedPayments: payments.filter(p => p.status === 'confirmed').length,
      expiredPayments: payments.filter(p => p.status === 'expired').length,
      mockTransactions: this.mockTransactions.size,
      environment: 'sandbox',
      sandboxWallet: this.sandboxWallet,
      network: this.network
    };
  }
}

module.exports = new SandboxPaymentService();
