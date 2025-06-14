const express = require('express');
const router = express.Router();
const EmailService = require('../services/emailService');
const { authenticateAPI } = require('../middleware/auth');
const Joi = require('joi');

const emailService = new EmailService();

// Validation schemas
const testEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const paymentEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  paymentData: Joi.object({
    paymentId: Joi.string().required(),
    amount: Joi.string().required(),
    originalAmount: Joi.string().required(),
    orderId: Joi.string().required(),
    walletAddress: Joi.string().required(),
    expiresAt: Joi.string().required()
  }).required()
});

const successEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  paymentData: Joi.object({
    paymentId: Joi.string().required(),
    amount: Joi.string().required(),
    originalAmount: Joi.string().required(),
    orderId: Joi.string().required(),
    txHash: Joi.string().required(),
    verifiedAt: Joi.string().required()
  }).required()
});

const expiredEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  paymentData: Joi.object({
    paymentId: Joi.string().required(),
    amount: Joi.string().required(),
    originalAmount: Joi.string().required(),
    orderId: Joi.string().required(),
    expiresAt: Joi.string().required()
  }).required()
});

// Test email endpoint
router.post('/test', authenticateAPI(['admin']), async (req, res) => {
  try {
    const { error, value } = testEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email } = value;
    const result = await emailService.sendTestEmail(email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
          email: email,
          environment: process.env.NODE_ENV || 'development'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send payment created email
router.post('/payment-created', authenticateAPI(['admin', 'payment:create']), async (req, res) => {
  try {
    const { error, value } = paymentEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, paymentData } = value;
    const result = await emailService.sendPaymentCreatedEmail(paymentData, email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment created email sent successfully',
        data: {
          messageId: result.messageId,
          email: email,
          paymentId: paymentData.paymentId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send payment created email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error in payment created email endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send payment success email
router.post('/payment-success', authenticateAPI(['admin', 'payment:verify']), async (req, res) => {
  try {
    const { error, value } = successEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, paymentData } = value;
    const result = await emailService.sendPaymentSuccessEmail(paymentData, email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment success email sent successfully',
        data: {
          messageId: result.messageId,
          email: email,
          paymentId: paymentData.paymentId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send payment success email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error in payment success email endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send payment expired email
router.post('/payment-expired', authenticateAPI(['admin', 'payment:create']), async (req, res) => {
  try {
    const { error, value } = expiredEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, paymentData } = value;
    const result = await emailService.sendPaymentExpiredEmail(paymentData, email);

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment expired email sent successfully',
        data: {
          messageId: result.messageId,
          email: email,
          paymentId: paymentData.paymentId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send payment expired email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error in payment expired email endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get email service status
router.get('/status', authenticateAPI(['admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        emailService: 'active',
        environment: process.env.NODE_ENV || 'development',
        smtpHost: process.env.NODE_ENV === 'sandbox' ? 'smtp.ethereal.email' : (process.env.SMTP_HOST || 'smtp.gmail.com'),
        fromEmail: process.env.FROM_EMAIL || 'noreply@cryptopayment.com',
        features: [
          'Payment created notifications',
          'Payment success notifications', 
          'Payment expired notifications',
          'Test email functionality'
        ]
      }
    });
  } catch (error) {
    console.error('Error in email status endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
