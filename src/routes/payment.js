const express = require('express');
const PaymentServiceFactory = require('../services/paymentServiceFactory');
const { validatePaymentRequest, validateVerificationRequest } = require('../validators/paymentValidator');
const { authenticateAPI, rateLimitByAPIKey } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate payment instructions
function generateInstructions(amount, token, network, expiresAt) {
  const networkNames = {
    'BSC': 'Binance Smart Chain (BSC)',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'POLYGON': 'Polygon'
  };

  const instructions = [];
  if (network.toUpperCase() === 'SOL') {
    instructions.push(
      `1. Send exactly ${amount} ${token} to the provided wallet address`,
      `2. Use Solana network`,
      `3. Payment expires at ${expiresAt}`,
      `4. You can scan the QR code with Solana-compatible wallet`
    );
  } else {
    instructions.push(
      `1. Send exactly ${amount} ${token} to the provided wallet address`,
      `2. Use ${networkNames[network.toUpperCase()] || network} network`,
      `3. Payment expires at ${expiresAt}`,
      `4. You can scan the QR code with compatible wallet`
    );
  }
  return instructions;
}

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

    const { amount, orderId, network = 'BSC', token = 'USDT', metadata } = req.body;
    
    const enhancedMetadata = {
      ...metadata,
      apiKeyName: req.apiKey.name,
      requestedBy: req.apiKey.keyHash ? req.apiKey.keyHash.substring(0, 8) + '...' : 'unknown',
      requestedAt: new Date().toISOString()
    };

    const paymentService = PaymentServiceFactory.getPaymentService(network, token);
    const payment = await paymentService.createPayment(amount, orderId, token, enhancedMetadata);

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
        contractAddress: payment.contractAddress,
        note: `Please pay exactly ${payment.amount} ${token} (${payment.originalAmount} + unique identifier)`,
        instructions: generateInstructions(payment.amount, token, network, payment.expiresAt)
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

    const { paymentId, txHash, network } = req.body;
    
    console.log(`Payment verification requested by ${req.apiKey.name} for payment ${paymentId}`);
    
    // Get payment first to determine network if not provided
    let paymentService;
    if (network) {
      paymentService = PaymentServiceFactory.getPaymentService(network);
    } else {
      // Try to get payment info to determine network
      const tempService = PaymentServiceFactory.getPaymentService('BSC'); // Default fallback
      const existingPayment = await tempService.getPayment(paymentId);
      if (existingPayment) {
        paymentService = PaymentServiceFactory.getPaymentService(existingPayment.network);
      } else {
        paymentService = tempService;
      }
    }
    
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
    const { network } = req.query;
    
    // Get payment first to determine network if not provided
    let paymentService;
    if (network) {
      paymentService = PaymentServiceFactory.getPaymentService(network);
    } else {
      // Try to get payment info to determine network
      const tempService = PaymentServiceFactory.getPaymentService('BSC'); // Default fallback
      const existingPayment = await tempService.getPayment(paymentId);
      if (existingPayment) {
        paymentService = PaymentServiceFactory.getPaymentService(existingPayment.network);
      } else {
        paymentService = tempService;
      }
    }
    
    const payment = await paymentService.getPayment(paymentId);

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
    const { network = 'BSC', token } = req.query;
    const paymentService = PaymentServiceFactory.getPaymentService(network);
    
    const networkConfig = require('../config/networks').getNetworkConfig(network);
    const supportedTokens = PaymentServiceFactory.getSupportedTokens(network);
    
    const balances = {};
    
    // Get native currency balance
    const nativeBalance = await paymentService.getWalletBalance();
    balances[networkConfig.nativeCurrency.symbol] = {
      amount: nativeBalance,
      symbol: networkConfig.nativeCurrency.symbol,
      name: networkConfig.nativeCurrency.name,
      type: 'native'
    };
    
    // Get token balances
    for (const tokenSymbol of supportedTokens) {
      try {
        const tokenBalance = await paymentService.getTokenBalance(tokenSymbol);
        const tokenConfig = networkConfig.tokens[tokenSymbol];
        balances[tokenSymbol] = {
          amount: tokenBalance,
          symbol: tokenSymbol,
          name: `${tokenSymbol} Token`,
          contractAddress: tokenConfig.address,
          type: 'token'
        };
      } catch (error) {
        console.warn(`Failed to get ${tokenSymbol} balance:`, error.message);
      }
    }

    res.json({
      success: true,
      data: {
        walletAddress: paymentService.walletAddress,
        network: networkConfig.name,
        balances,
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
    const { status, network, limit = 50, offset = 0 } = req.query;
    
    // If network is specified, use that service, otherwise get all payments from database
    let payments;
    if (network) {
      const paymentService = PaymentServiceFactory.getPaymentService(network);
      payments = await paymentService.getAllPayments(status);
    } else {
      // Get payments from database service directly for all networks
      const databaseService = require('../services/databaseService');
      payments = await databaseService.getAllPayments(status);
    }
    
    // Apply pagination and sorting
    const sortedPayments = payments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + parseInt(limit));

    const total = payments.length;

    res.json({
      success: true,
      data: {
        payments: sortedPayments.map(payment => ({
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

// New endpoint to get supported networks and tokens
router.get('/networks', authenticateAPI('payment:status'), async (req, res) => {
  try {
    const supportedNetworks = PaymentServiceFactory.getSupportedNetworks();
    const networkInfo = {};
    
    for (const network of supportedNetworks) {
      const tokens = PaymentServiceFactory.getSupportedTokens(network);
      const envInfo = PaymentServiceFactory.getEnvironmentInfo(network);
      networkInfo[network] = {
        name: network,
        tokens,
        environment: envInfo
      };
    }

    res.json({
      success: true,
      data: {
        supportedNetworks,
        networkInfo,
        environment: PaymentServiceFactory.isSandboxMode() ? 'sandbox' : 
                    PaymentServiceFactory.isTestnetMode() ? 'testnet' : 'production'
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
