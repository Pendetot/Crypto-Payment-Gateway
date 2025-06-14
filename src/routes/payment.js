const express = require('express');
const PaymentServiceFactory = require('../services/paymentServiceFactory');
const { validatePaymentRequest, validateVerificationRequest } = require('../validators/paymentValidator');
const { authenticateAPI, rateLimitByAPIKey } = require('../middleware/auth');

const router = express.Router();

router.use(rateLimitByAPIKey());

router.post('/create', authenticateAPI('payment:create'), async (req, res) => {
  try {
    const { error } = validatePaymentRequest(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { amount, orderId, metadata } = req.body;
    
    const enhancedMetadata = {
      ...metadata,
      apiKeyName: req.apiKey.name,
      requestedBy: req.apiKey.keyHash ? req.apiKey.keyHash.substring(0, 8) + '...' : 'unknown',
      requestedAt: new Date().toISOString()
    };

    const paymentService = PaymentServiceFactory.getPaymentService();
    const payment = await paymentService.createPayment(amount, orderId, enhancedMetadata);

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        originalAmount: payment.originalAmount,
        amount: payment.amount,
        walletAddress: payment.walletAddress,
        trustWalletUrl: payment.trustWalletUrl,
        qrCode: payment.qrCode,
        expiresAt: payment.expiresAt,
        network: payment.network,
        token: payment.token,
        note: `Please pay exactly ${payment.amount} USDT (${payment.originalAmount} + unique identifier)`,
        instructions: [
          `1. Send exactly ${payment.amount} USDT to the provided wallet address`,
          `2. Use BSC (Binance Smart Chain) network`,
          `3. Payment expires at ${payment.expiresAt}`,
          `4. You can scan the QR code with Trust Wallet for easy payment`
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/verify', authenticateAPI('payment:verify'), async (req, res) => {
  try {
    const { error } = validateVerificationRequest(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { paymentId, txHash } = req.body;
    
    console.log(`Payment verification requested by ${req.apiKey.name} for payment ${paymentId}`);
    
    const paymentService = PaymentServiceFactory.getPaymentService();
    const payment = await paymentService.verifyPayment(paymentId, txHash);

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        originalAmount: payment.originalAmount,
        paidAmount: payment.amount,
        status: payment.status,
        txHash: payment.txHash,
        confirmations: payment.confirmations,
        verifiedAt: payment.verifiedAt,
        message: payment.status === 'confirmed' 
          ? 'Payment confirmed successfully' 
          : `Payment verified but waiting for ${process.env.MIN_CONFIRMATIONS} confirmations`
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/status/:paymentId', authenticateAPI('payment:status'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentService = PaymentServiceFactory.getPaymentService();
    const payment = paymentService.getPayment(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (!req.apiKey.permissions.includes('admin')) {
      const paymentMetadata = payment.metadata || {};
      const requestedBy = req.apiKey.key.substring(0, 8) + '...';
      
      if (paymentMetadata.requestedBy !== requestedBy) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this payment'
        });
      }
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        originalAmount: payment.originalAmount,
        amount: payment.amount,
        orderId: payment.orderId,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        txHash: payment.txHash,
        confirmations: payment.confirmations,
        verifiedAt: payment.verifiedAt,
        network: payment.network,
        token: payment.token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/balance', authenticateAPI('payment:balance'), async (req, res) => {
  try {
    const paymentService = PaymentServiceFactory.getPaymentService();
    const [bnbBalance, usdtBalance] = await Promise.all([
      paymentService.getWalletBalance(),
      paymentService.getUSDTBalance()
    ]);

    res.json({
      success: true,
      data: {
        walletAddress: process.env.WALLET_ADDRESS,
        balances: {
          BNB: {
            amount: bnbBalance,
            symbol: 'BNB',
            name: 'Binance Coin'
          },
          USDT: {
            amount: usdtBalance,
            symbol: 'USDT',
            name: 'Tether USD',
            contractAddress: process.env.USDT_CONTRACT_ADDRESS
          }
        },
        network: 'BSC (Binance Smart Chain)',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/list', authenticateAPI('admin'), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const paymentService = PaymentServiceFactory.getPaymentService();
    
    const payments = Array.from(paymentService.pendingPayments.values())
      .filter(payment => !status || payment.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + parseInt(limit));

    const total = Array.from(paymentService.pendingPayments.values())
      .filter(payment => !status || payment.status === status).length;

    res.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          paymentId: payment.id,
          status: payment.status,
          originalAmount: payment.originalAmount,
          amount: payment.amount,
          orderId: payment.orderId,
          createdAt: payment.createdAt,
          expiresAt: payment.expiresAt,
          txHash: payment.txHash,
          confirmations: payment.confirmations,
          network: payment.network,
          token: payment.token,
          metadata: payment.metadata
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (offset + parseInt(limit)) < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
