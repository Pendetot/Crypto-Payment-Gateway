const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getMint } = require('@solana/spl-token');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const databaseService = require('./databaseService');
const { getNetworkConfig } = require('../config/networks');

class SolanaPaymentService {
  constructor(isTestnet = false) {
    this.isTestnet = isTestnet;
    this.networkConfig = getNetworkConfig('SOL', isTestnet);
    this.connection = new Connection(this.networkConfig.rpcUrl, 'confirmed');
    this.walletAddress = process.env.SOL_WALLET_ADDRESS || process.env.WALLET_ADDRESS;
  }

  async generateUniqueAmount(originalAmount) {
    let attempts = 0;
    let uniqueAmount;
    
    do {
      const randomLamports = Math.floor(Math.random() * 999999) + 1;
      const lamportsDecimal = randomLamports / 1000000;
      
      uniqueAmount = parseFloat((originalAmount + lamportsDecimal).toFixed(6));
      attempts++;
      
      if (attempts > 50) {
        const timestamp = Date.now() % 1000000;
        uniqueAmount = parseFloat((originalAmount + (timestamp / 1000000)).toFixed(6));
        break;
      }
    } while (await databaseService.isAmountUsed(uniqueAmount));
    
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    await databaseService.addUsedAmount(uniqueAmount, expiresAt);
    
    return uniqueAmount;
  }

  async createPayment(amount, orderId, token = 'SOL', metadata = {}) {
    const paymentId = uuidv4();
    const expiresAt = new Date(Date.now() + (process.env.PAYMENT_TIMEOUT * 1000));
    
    const uniqueAmount = await this.generateUniqueAmount(parseFloat(amount));
    const tokenConfig = this.networkConfig.tokens[token.toUpperCase()];
    
    if (!tokenConfig && token.toUpperCase() !== 'SOL') {
      throw new Error(`Token ${token} not supported on Solana network`);
    }

    const paymentData = {
      id: paymentId,
      originalAmount: amount.toString(), 
      amount: uniqueAmount.toString(), 
      orderId,
      walletAddress: this.walletAddress,
      contractAddress: tokenConfig ? tokenConfig.address : null,
      network: 'SOL',
      token: token.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      metadata
    };

    const solanaPayUrl = await this.generateSolanaPayUrl(uniqueAmount, paymentId, tokenConfig);
    const qrCode = await this.generateQRCode(solanaPayUrl);

    paymentData.trustWalletUrl = solanaPayUrl;
    paymentData.qrCode = qrCode;

    await databaseService.createPayment(paymentData);
    
    setTimeout(() => {
      this.expirePayment(paymentId);
    }, process.env.PAYMENT_TIMEOUT * 1000);

    return paymentData;
  }

  async generateSolanaPayUrl(amount, paymentId, tokenConfig) {
    const recipient = this.walletAddress;
    const params = new URLSearchParams();
    
    params.append('recipient', recipient);
    params.append('amount', amount.toString());
    params.append('memo', paymentId);
    
    if (tokenConfig) {
      params.append('spl-token', tokenConfig.address);
    }
    
    return `solana:${recipient}?${params.toString()}`;
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

      const transaction = await this.connection.getTransaction(txHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.meta.err) {
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
        blockNumber: transaction.slot,
        gasUsed: transaction.meta.fee,
        gasPrice: '0'
      });
      
      return await databaseService.getPayment(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async validateTransaction(transaction, payment) {
    try {
      const walletPubkey = new PublicKey(this.walletAddress);
      
      if (payment.token === 'SOL') {
        // Native SOL transfer validation
        const preBalance = transaction.meta.preBalances[1] || 0;
        const postBalance = transaction.meta.postBalances[1] || 0;
        const transferAmount = (postBalance - preBalance) / LAMPORTS_PER_SOL;
        
        return Math.abs(transferAmount - parseFloat(payment.amount)) < 0.000001;
      } else {
        // SPL Token transfer validation
        const tokenConfig = this.networkConfig.tokens[payment.token];
        if (!tokenConfig) return false;
        
        const mintPubkey = new PublicKey(tokenConfig.address);
        const tokenAccountAddress = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
        
        // Check token balance changes
        const preTokenBalances = transaction.meta.preTokenBalances || [];
        const postTokenBalances = transaction.meta.postTokenBalances || [];
        
        const preBalance = preTokenBalances.find(b => 
          b.owner === this.walletAddress && b.mint === tokenConfig.address
        )?.uiTokenAmount?.uiAmount || 0;
        
        const postBalance = postTokenBalances.find(b => 
          b.owner === this.walletAddress && b.mint === tokenConfig.address
        )?.uiTokenAmount?.uiAmount || 0;
        
        const transferAmount = postBalance - preBalance;
        return Math.abs(transferAmount - parseFloat(payment.amount)) < 0.000001;
      }
    } catch (error) {
      console.error('Transaction validation error:', error);
      return false;
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
      const transaction = await this.connection.getTransaction(txHash, {
        commitment: 'confirmed'
      });
      
      if (!transaction || !transaction.slot) {
        return 0;
      }

      const currentSlot = await this.connection.getSlot('confirmed');
      return currentSlot - transaction.slot + 1;
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
      const publicKey = new PublicKey(this.walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return (balance / LAMPORTS_PER_SOL).toString();
    } catch (error) {
      throw new Error('Failed to get wallet balance');
    }
  }

  async getTokenBalance(token = 'SOL') {
    try {
      if (token.toUpperCase() === 'SOL') {
        return await this.getWalletBalance();
      }

      const tokenConfig = this.networkConfig.tokens[token.toUpperCase()];
      if (!tokenConfig) {
        throw new Error(`Token ${token} not supported`);
      }

      const walletPubkey = new PublicKey(this.walletAddress);
      const mintPubkey = new PublicKey(tokenConfig.address);
      
      try {
        const tokenAccountAddress = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
        const tokenAccountInfo = await this.connection.getTokenAccountBalance(tokenAccountAddress);
        return tokenAccountInfo.value.uiAmount?.toString() || '0';
      } catch (error) {
        // Token account might not exist
        return '0';
      }
    } catch (error) {
      throw new Error(`Failed to get ${token} balance`);
    }
  }
}

module.exports = SolanaPaymentService;
