const { Web3 } = require('web3');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const databaseService = require('./databaseService');
const { getNetworkConfig } = require('../config/networks');

class BSCPaymentService {
  constructor(isTestnet = false) {
    this.isTestnet = isTestnet;
    this.networkConfig = getNetworkConfig('BSC', isTestnet);
    this.web3 = new Web3(this.networkConfig.rpcUrl);
    this.walletAddress = process.env.WALLET_ADDRESS;
  }

  async generateUniqueAmount(originalAmount) {
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
    
    if (!tokenConfig) {
      throw new Error(`Token ${token} not supported on BSC network`);
    }

    const paymentData = {
      id: paymentId,
      originalAmount: amount.toString(), 
      amount: uniqueAmount.toString(), 
      orderId,
      walletAddress: this.walletAddress,
      contractAddress: tokenConfig.address,
      network: 'BSC',
      token: token.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      metadata
    };

    const trustWalletUrl = this.generateTrustWalletUrl(uniqueAmount, paymentId, tokenConfig.address);
    const qrCode = await this.generateQRCode(trustWalletUrl);

    paymentData.trustWalletUrl = trustWalletUrl;
    paymentData.qrCode = qrCode;

    await databaseService.createPayment(paymentData);
    
    setTimeout(() => {
      this.expirePayment(paymentId);
    }, process.env.PAYMENT_TIMEOUT * 1000);

    return paymentData;
  }

  generateTrustWalletUrl(amount, paymentId, contractAddress) {
    const params = new URLSearchParams({
      address: this.walletAddress,
      amount: amount.toString(),
      token: contractAddress,
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
        gasUsed: receipt.gasUsed,
        gasPrice: transaction.gasPrice
      });
      
      return await databaseService.getPayment(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async validateTransaction(transaction, payment) {
    if (transaction.to.toLowerCase() !== payment.contract_address.toLowerCase()) {
      return false;
    }

    try {
      const decodedInput = this.web3.eth.abi.decodeParameters(
        ['address', 'uint256'],
        transaction.input.slice(10)
      );
      
      const [toAddress, amount] = decodedInput;
      const tokenConfig = this.networkConfig.tokens[payment.token];
      const decimals = tokenConfig.decimals === 6 ? 'mwei' : 'ether';
      const expectedAmount = this.web3.utils.toWei(payment.amount, decimals);
      
      return toAddress.toLowerCase() === this.walletAddress.toLowerCase() && 
             amount.toString() === expectedAmount.toString();
    } catch (error) {
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
      
      await databaseService.removeUsedAmount(parseFloat(payment.amount));
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

  async getTokenBalance(token = 'USDT') {
    try {
      const tokenConfig = this.networkConfig.tokens[token.toUpperCase()];
      if (!tokenConfig) {
        throw new Error(`Token ${token} not supported`);
      }

      const contract = new this.web3.eth.Contract([
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }
      ], tokenConfig.address);

      const balance = await contract.methods.balanceOf(this.walletAddress).call();
      const decimals = tokenConfig.decimals === 6 ? 'mwei' : 'ether';
      return this.web3.utils.fromWei(balance, decimals);
    } catch (error) {
      throw new Error(`Failed to get ${token} balance`);
    }
  }
}

module.exports = BSCPaymentService;
