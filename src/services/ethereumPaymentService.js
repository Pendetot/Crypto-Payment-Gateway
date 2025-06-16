const { ethers } = require('ethers');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const databaseService = require('./databaseService');
const { getNetworkConfig } = require('../config/networks');

class EthereumPaymentService {
  constructor(isTestnet = false) {
    this.isTestnet = isTestnet;
    this.networkConfig = getNetworkConfig('ETH', isTestnet);
    this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.walletAddress = process.env.ETH_WALLET_ADDRESS || process.env.WALLET_ADDRESS;
  }

  async generateUniqueAmount(originalAmount) {
    let attempts = 0;
    let uniqueAmount;
    
    do {
      const randomCents = Math.floor(Math.random() * 99) + 1;
      const centsDecimal = randomCents / 100;
      
      uniqueAmount = parseFloat((originalAmount + centsDecimal).toFixed(6));
      attempts++;
      
      if (attempts > 50) {
        const timestamp = Date.now() % 100;
        uniqueAmount = parseFloat((originalAmount + (timestamp / 100)).toFixed(6));
        break;
      }
    } while (await databaseService.isAmountUsed(uniqueAmount));
    
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    await databaseService.addUsedAmount(uniqueAmount, expiresAt);
    
    return uniqueAmount;
  }

  async createPayment(amount, orderId, token = 'USDT', metadata = {}) {
    const paymentId = uuidv4();
    const expiresAt = new Date(Date.now() + (process.env.PAYMENT_TIMEOUT * 1000));
    
    const uniqueAmount = await this.generateUniqueAmount(parseFloat(amount));
    const tokenConfig = this.networkConfig.tokens[token.toUpperCase()];
    
    if (!tokenConfig && token.toUpperCase() !== 'ETH') {
      throw new Error(`Token ${token} not supported on Ethereum network`);
    }

    const paymentData = {
      id: paymentId,
      originalAmount: amount.toString(), 
      amount: uniqueAmount.toString(), 
      orderId,
      walletAddress: this.walletAddress,
      contractAddress: tokenConfig ? tokenConfig.address : null,
      network: 'ETH',
      token: token.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      metadata
    };

    const walletUrl = this.generateWalletUrl(uniqueAmount, paymentId, tokenConfig);
    const qrCode = await this.generateQRCode(walletUrl);

    paymentData.trustWalletUrl = walletUrl;
    paymentData.qrCode = qrCode;

    await databaseService.createPayment(paymentData);
    
    setTimeout(() => {
      this.expirePayment(paymentId);
    }, process.env.PAYMENT_TIMEOUT * 1000);

    return paymentData;
  }

  generateWalletUrl(amount, paymentId, tokenConfig) {
    if (!tokenConfig) {
      // Native ETH transfer
      const params = new URLSearchParams({
        address: this.walletAddress,
        amount: amount.toString(),
        memo: paymentId
      });
      return `ethereum:${this.walletAddress}@${this.networkConfig.chainId}?${params.toString()}`;
    } else {
      // ERC-20 token transfer
      const params = new URLSearchParams({
        address: this.walletAddress,
        amount: amount.toString(),
        token: tokenConfig.address,
        memo: paymentId
      });
      return `ethereum:${tokenConfig.address}@${this.networkConfig.chainId}/transfer?${params.toString()}`;
    }
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

      const transaction = await this.provider.getTransaction(txHash);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      const isValid = await this.validateTransaction(transaction, payment);
      if (!isValid) {
        throw new Error('Invalid transaction');
      }

      const confirmations = await this.getConfirmations(txHash);
      
      const updates = {
        tx_hash: txHash,
        confirmations: confirmations,
        status: confirmations >= process.env.MIN_CONFIRMATIONS ? 'confirmed' : 'pending_confirmation',
        verified_at: new Date().toISOString()
      };

      await databaseService.updatePayment(paymentId, updates);
      
      await databaseService.logTransaction({
        paymentId,
        txHash,
        status: updates.status,
        confirmations,
        blockNumber: transaction.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: transaction.gasPrice.toString()
      });
      
      return await databaseService.getPayment(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async validateTransaction(transaction, payment) {
    if (payment.token === 'ETH') {
      // Native ETH transfer validation
      return transaction.to.toLowerCase() === this.walletAddress.toLowerCase() &&
             parseFloat(ethers.formatEther(transaction.value)) === parseFloat(payment.amount);
    } else {
      // ERC-20 token transfer validation
      if (transaction.to.toLowerCase() !== payment.contract_address.toLowerCase()) {
        return false;
      }

      try {
        const tokenConfig = this.networkConfig.tokens[payment.token];
        const iface = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        
        const decoded = iface.parseTransaction({ data: transaction.data });
        const [toAddress, amount] = decoded.args;
        
        const expectedAmount = ethers.parseUnits(payment.amount, tokenConfig.decimals);
        
        return toAddress.toLowerCase() === this.walletAddress.toLowerCase() && 
               amount.toString() === expectedAmount.toString();
      } catch (error) {
        return false;
      }
    }
  }

  async findPaymentByAmount(amount) {
    const payment = await databaseService.findPaymentByAmount(parseFloat(amount));
    if (payment) {
      return { paymentId: payment.id, payment };
    }
    return null;
  }

  async getConfirmations(txHash) {
    try {
      const transaction = await this.provider.getTransaction(txHash);
      if (!transaction || !transaction.blockNumber) {
        return 0;
      }

      const currentBlock = await this.provider.getBlockNumber();
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
      
      await databaseService.removeUsedAmount(parseFloat(payment.amount));
    }
  }

  async getAllPayments(status = null) {
    return await databaseService.getAllPayments(status);
  }

  async getWalletBalance() {
    try {
      const balance = await this.provider.getBalance(this.walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error('Failed to get wallet balance');
    }
  }

  async getTokenBalance(token = 'USDT') {
    try {
      if (token.toUpperCase() === 'ETH') {
        return await this.getWalletBalance();
      }

      const tokenConfig = this.networkConfig.tokens[token.toUpperCase()];
      if (!tokenConfig) {
        throw new Error(`Token ${token} not supported`);
      }

      const contract = new ethers.Contract(
        tokenConfig.address,
        ['function balanceOf(address owner) view returns (uint256)'],
        this.provider
      );

      const balance = await contract.balanceOf(this.walletAddress);
      return ethers.formatUnits(balance, tokenConfig.decimals);
    } catch (error) {
      throw new Error(`Failed to get ${token} balance`);
    }
  }
}

module.exports = EthereumPaymentService;
