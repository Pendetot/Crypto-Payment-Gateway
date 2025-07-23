const express = require('express');
const crypto = require('crypto');
const paymentService = require('../services/paymentService');

const router = express.Router();

// Deterministic JSON serialization for signature verification
function createDeterministicSignature(data, secret) {
  // Sort object keys recursively for deterministic serialization
  function sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object' || obj instanceof Array) {
      return obj;
    }
    
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
    return sorted;
  }
  
  const sortedData = sortObjectKeys(data);
  const body = JSON.stringify(sortedData);
  
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}

function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  if (!process.env.WEBHOOK_SECRET) {
    console.error('❌ WEBHOOK_SECRET environment variable not set');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  const expectedSignature = createDeterministicSignature(req.body, process.env.WEBHOOK_SECRET);

  if (signature !== expectedSignature) {
    console.error('Webhook signature mismatch:', {
      received: signature,
      expected: expectedSignature,
      body: req.body
    });
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
}

router.post('/payment-confirmed', verifyWebhookSignature, async (req, res) => {
  try {
    const { paymentId, txHash, confirmations } = req.body;
    
    // Validate input parameters
    if (!paymentId || !txHash || typeof confirmations !== 'number') {
      return res.status(400).json({ 
        error: 'Missing or invalid parameters',
        required: ['paymentId', 'txHash', 'confirmations']
      });
    }
    
    const payment = await paymentService.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const minConfirmations = parseInt(process.env.MIN_CONFIRMATIONS);
    if (confirmations >= minConfirmations) {
      const updates = {
        status: 'confirmed',
        confirmations: confirmations,
        confirmed_at: new Date().toISOString()
      };
      
      await require('../services/databaseService').updatePayment(paymentId, updates);
      
      console.log(`Payment ${paymentId} confirmed with ${confirmations} confirmations`);
      console.log(`Original amount: $${payment.originalAmount}, Paid: $${payment.amount}`);
    } else {
      await require('../services/databaseService').updatePayment(paymentId, {
        confirmations: confirmations
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transaction-notification', verifyWebhookSignature, async (req, res) => {
  try {
    const { txHash, toAddress, amount, token } = req.body;
    
    // Validate input parameters
    if (!txHash || !toAddress || !amount || !token) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['txHash', 'toAddress', 'amount', 'token']
      });
    }
    
    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({ error: 'Invalid transaction hash format' });
    }
    
    // Validate address formats
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress) || !/^0x[a-fA-F0-9]{40}$/.test(token)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    
    if (toAddress.toLowerCase() === process.env.WALLET_ADDRESS.toLowerCase() &&
        token.toLowerCase() === process.env.USDT_CONTRACT_ADDRESS.toLowerCase()) {
      
      console.log(`New USDT transaction received: ${txHash}, Amount: ${amount}`);
            
      const paymentMatch = await paymentService.findPaymentByAmount(amount);
      
      if (paymentMatch) {
        const { paymentId, payment } = paymentMatch;
        
        try {
          await paymentService.verifyPayment(paymentId, txHash);
          console.log(`Auto-verified payment ${paymentId}`);
          console.log(`Original amount: $${payment.originalAmount}, Paid: $${payment.amount}`);
        } catch (error) {
          console.error(`Auto-verification failed for ${paymentId}:`, error.message);
        }
      } else {
        console.log(`No matching pending payment found for amount: ${amount}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Transaction notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;