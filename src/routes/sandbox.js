const express = require('express');
const PaymentServiceFactory = require('../services/paymentServiceFactory');
const { authenticateAPI } = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure sandbox mode
const ensureSandboxMode = (req, res, next) => {
  if (!PaymentServiceFactory.isSandboxMode()) {
    return res.status(403).json({
      success: false,
      error: 'Sandbox endpoints are only available in sandbox mode',
      hint: 'Set NODE_ENV=sandbox or SANDBOX_MODE=true to enable sandbox mode'
    });
  }
  next();
};

router.use(ensureSandboxMode);

// Get sandbox environment info
router.get('/info', (req, res) => {
  const envInfo = PaymentServiceFactory.getEnvironmentInfo();
  const paymentService = PaymentServiceFactory.getPaymentService();
  
  res.json({
    success: true,
    data: {
      ...envInfo,
      sandboxStats: paymentService.getSandboxStats(),
      features: [
        'Mock payment creation',
        'Simulated transaction verification',
        'Test payment simulation',
        'Sandbox data management',
        'Safe testing environment'
      ],
      endpoints: {
        'GET /api/sandbox/info': 'Get sandbox information',
        'POST /api/sandbox/simulate/:paymentId': 'Simulate payment completion',
        'GET /api/sandbox/payments': 'Get all sandbox payments',
        'DELETE /api/sandbox/payments': 'Clear all sandbox payments',
        'GET /api/sandbox/stats': 'Get sandbox statistics'
      }
    }
  });
});

// Simulate payment completion
router.post('/simulate/:paymentId', authenticateAPI('payment:verify'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentService = PaymentServiceFactory.getPaymentService();
    
    const payment = await paymentService.simulatePayment(paymentId);
    
    res.json({
      success: true,
      message: 'Payment simulated successfully',
      data: {
        paymentId: payment.id,
        originalAmount: payment.originalAmount,
        paidAmount: payment.amount,
        status: payment.status,
        txHash: payment.txHash,
        confirmations: payment.confirmations,
        verifiedAt: payment.verifiedAt,
        sandboxMode: true,
        simulatedTransaction: true
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get all sandbox payments
router.get('/payments', authenticateAPI('admin'), (req, res) => {
  try {
    const paymentService = PaymentServiceFactory.getPaymentService();
    const payments = paymentService.getAllPayments();
    
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
        total: payments.length,
        environment: 'sandbox'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear all sandbox payments
router.delete('/payments', authenticateAPI('admin'), (req, res) => {
  try {
    const paymentService = PaymentServiceFactory.getPaymentService();
    paymentService.clearAllPayments();
    
    res.json({
      success: true,
      message: 'All sandbox payments cleared successfully',
      data: {
        clearedAt: new Date().toISOString(),
        environment: 'sandbox'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sandbox statistics
router.get('/stats', authenticateAPI('payment:status'), (req, res) => {
  try {
    const paymentService = PaymentServiceFactory.getPaymentService();
    const stats = paymentService.getSandboxStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create test payment with predefined scenarios
router.post('/test-payment', authenticateAPI('payment:create'), async (req, res) => {
  try {
    const { scenario = 'normal', amount = 10, orderId } = req.body;
    const paymentService = PaymentServiceFactory.getPaymentService();
    
    const testOrderId = orderId || `TEST-${Date.now()}`;
    const testMetadata = {
      testScenario: scenario,
      apiKeyName: req.apiKey.name,
      requestedBy: req.apiKey.key.substring(0, 8) + '...',
      requestedAt: new Date().toISOString(),
      sandboxTest: true
    };

    const payment = await paymentService.createPayment(amount, testOrderId, testMetadata);

    res.json({
      success: true,
      message: `Test payment created with scenario: ${scenario}`,
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
        scenario: scenario,
        sandboxMode: true,
        instructions: [
          `1. This is a SANDBOX payment - no real money involved`,
          `2. Send exactly ${payment.amount} USDT to the provided wallet address`,
          `3. Use BSC Testnet network`,
          `4. Or use POST /api/sandbox/simulate/${payment.id} to simulate payment`,
          `5. Payment expires at ${payment.expiresAt}`
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

module.exports = router;
