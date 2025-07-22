const { Web3 } = require('web3');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { validatePaymentRequest } = require('../validators/paymentValidator');
const databaseService = require('./databaseService');

// Utility for precise decimal calculations
class DecimalUtils {
  static multiply(a, b) {
    const aDecimal = (a.toString().split('.')[1] || '').length;
    const bDecimal = (b.toString().split('.')[1] || '').length;
    const multiplier = Math.pow(10, Math.max(aDecimal, bDecimal));
    return Math.round(a * multiplier) * Math.round(b * multiplier) / (multiplier * multiplier);
  }
  
  static add(a, b) {
    const aDecimal = (a.toString().split('.')[1] || '').length;
    const bDecimal = (b.toString().split('.')[1] || '').length;
    const multiplier = Math.pow(10, Math.max(aDecimal, bDecimal));
    return (Math.round(a * multiplier) + Math.round(b * multiplier)) / multiplier;
  }
  
  static toFixed(value, decimals = 2) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }
}

class PaymentService {
  constructor() {
    this.web3 = new Web3(process.env.BSC_RPC_URL);
    this.usdtContract = process.env.USDT_CONTRACT_ADDRESS;
    this.walletAddress = process.env.WALLET_ADDRESS;
    this.paymentTimeouts = new Map(); // Track payment timeouts for cleanup
  }

  async generateUniqueAmount(originalAmount) {
    let attempts = 0;
    let uniqueAmount;
    
    // Convert to number with proper validation
    const baseAmount = typeof originalAmount === 'string' ? parseFloat(originalAmount) : originalAmount;
    if (isNaN(baseAmount) || baseAmount <= 0) {
      throw new Error('Invalid base amount');
    }
    
    do {
      const randomCents = Math.floor(Math.random() * 99) + 1;
      const centsDecimal = randomCents / 100;
      
      // Use precise decimal arithmetic
      uniqueAmount = DecimalUtils.toFixed(DecimalUtils.add(baseAmount, centsDecimal), 2);
      attempts++;
      
      if (attempts > 50) {
        const timestamp = Date.now() % 100;
        uniqueAmount = DecimalUtils.toFixed(DecimalUtils.add(baseAmount, timestamp / 100), 2);
        break;
      }
    } while (await databaseService.isAmountUsed(uniqueAmount));
    
    // Add to database with 24 hour expiry
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    await databaseService.addUsedAmount(uniqueAmount, expiresAt);
    
    return uniqueAmount;
  }

  async createPayment(amount, orderId, metadata = {}) {
    const paymentId = uuidv4();
    const timeoutMs = parseInt(process.env.PAYMENT_TIMEOUT) * 1000;
    const expiresAt = new Date(Date.now() + timeoutMs);
    
    // Validate and convert amount
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    const uniqueAmount = await this.generateUniqueAmount(numericAmount);
    
    const paymentData = {
      id: paymentId,
      originalAmount: numericAmount.toString(), 
      amount: uniqueAmount.toString(), 
      orderId,
      walletAddress: this.walletAddress,
      contractAddress: this.usdtContract,
      network: 'BSC',
      token: 'USDT',
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      metadata
    };

    const trustWalletUrl = this.generateTrustWalletUrl(uniqueAmount, paymentId);
    const qrCode = await this.generateQRCode(trustWalletUrl);

    paymentData.trustWalletUrl = trustWalletUrl;
    paymentData.qrCode = qrCode;

    // Save to database
    await databaseService.createPayment(paymentData);
    
    // Set expiration timer with cleanup
    const timeoutId = setTimeout(async () => {
      await this.expirePayment(paymentId);
      this.paymentTimeouts.delete(paymentId);
    }, timeoutMs);
    
    this.paymentTimeouts.set(paymentId, timeoutId);

    return paymentData;
  }

  generateTrustWalletUrl(amount, paymentId) {
    const params = new URLSearchParams({
      address: this.walletAddress,
      amount: amount.toString(),
      token: this.usdtContract,
      memo: paymentId
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
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async verifyPayment(paymentId, txHash) {
    try {
      const payment = await databaseService.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending') {
        throw new Error('Payment already processed');
      }

      const transaction = await this.web3.eth.getTransaction(txHash);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      if (!receipt || !receipt.status) {
        throw new Error('Transaction failed');
      }

      const isValid = await this.validateTransaction(transaction, payment);
      if (!isValid) {
        throw new Error('Invalid transaction');
      }

      const confirmations = await this.getConfirmations(txHash);
      const minConfirmations = parseInt(process.env.MIN_CONFIRMATIONS);
      
      const updates = {
        tx_hash: txHash,
        confirmations: confirmations,
        status: confirmations >= minConfirmations ? 'confirmed' : 'pending_confirmation',
        verified_at: new Date().toISOString()
      };

      await databaseService.updatePayment(paymentId, updates);
      
      // Clear timeout if payment is verified
      if (this.paymentTimeouts.has(paymentId)) {
        clearTimeout(this.paymentTimeouts.get(paymentId));
        this.paymentTimeouts.delete(paymentId);
      }
      
      // Log transaction
      await databaseService.logTransaction({
        paymentId,
        txHash,
        status: updates.status,
        confirmations,
        blockNumber: transaction.blockNumber,
        gasUsed: receipt.gasUsed,
        gasPrice: transaction.gasPrice
      });
      
      return await databaseService.getPayment(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async validateTransaction(transaction, payment) {
    if (transaction.to.toLowerCase() !== this.usdtContract.toLowerCase()) {
      return false;
    }

    try {
      const decodedInput = this.web3.eth.abi.decodeParameters(
        ['address', 'uint256'],
        transaction.input.slice(10)
      );
      
      const [toAddress, amount] = decodedInput;
      const expectedAmount = this.web3.utils.toWei(payment.amount, 'mwei');
      
      return toAddress.toLowerCase() === this.walletAddress.toLowerCase() && 
             amount.toString() === expectedAmount.toString();
    } catch (error) {
      return false;
    }
  }

  async findPaymentByAmount(amount) {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return null;
    }
    
    const payment = await databaseService.findPaymentByAmount(numericAmount);
    if (payment) {
      return { paymentId: payment.id, payment };
    }
    return null;
  }

  async getConfirmations(txHash) {
    try {
      const transaction = await this.web3.eth.getTransaction(txHash);
      if (!transaction || !transaction.blockNumber) {
        return 0;
      }

      const currentBlock = await this.web3.eth.getBlockNumber();
      return currentBlock - transaction.blockNumber + 1;
    } catch (error) {
      return 0;
    }
  }

  async getPayment(paymentId) {
    return await databaseService.getPayment(paymentId);
  }

  async expirePayment(paymentId) {
    const payment = await databaseService.getPayment(paymentId);
    if (payment && payment.status === 'pending') {
      await databaseService.updatePayment(paymentId, { 
        status: 'expired' 
      });
      
      // Remove from used amounts
      const numericAmount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      if (!isNaN(numericAmount) && numericAmount > 0) {
        await databaseService.removeUsedAmount(numericAmount);
      }
      
      // Clean up timeout tracking
      if (this.paymentTimeouts.has(paymentId)) {
        this.paymentTimeouts.delete(paymentId);
      }
    }
  }

  async getAllPayments(status = null) {
    return await databaseService.getAllPayments(status);
  }

  async getWalletBalance() {
    try {
      const balance = await this.web3.eth.getBalance(this.walletAddress);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      throw new Error('Failed to get wallet balance');
    }
  }

  async getUSDTBalance() {
    try {
      const contract = new this.web3.eth.Contract([
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }
      ], this.usdtContract);

      const balance = await contract.methods.balanceOf(this.walletAddress).call();
      return this.web3.utils.fromWei(balance, 'mwei');
    } catch (error) {
      throw new Error('Failed to get USDT balance');
    }
  }
}

module.exports = new PaymentService();
