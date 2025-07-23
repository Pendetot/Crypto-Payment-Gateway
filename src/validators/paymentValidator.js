const Joi = require('joi');

const paymentRequestSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(6)
    .min(0.01) // Minimum payment amount
    .max(1000000) // Maximum payment amount for safety
    .required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'number.min': 'Minimum payment amount is 0.01',
      'number.max': 'Maximum payment amount is 1,000,000',
      'number.precision': 'Amount precision cannot exceed 6 decimal places'
    }),
  orderId: Joi.string()
    .alphanum()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.alphanum': 'Order ID must contain only alphanumeric characters',
      'string.min': 'Order ID cannot be empty',
      'string.max': 'Order ID cannot exceed 100 characters'
    }),
  metadata: Joi.object()
    .max(50) // Limit number of metadata fields
    .optional()
    .messages({
      'object.max': 'Metadata cannot contain more than 50 fields'
    })
});

const verificationRequestSchema = Joi.object({
  paymentId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Payment ID must be a valid UUID v4'
    }),
  txHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Transaction hash must be a valid 64-character hex string with 0x prefix'
    })
});

const webhookPaymentSchema = Joi.object({
  paymentId: Joi.string()
    .uuid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.guid': 'Payment ID must be a valid UUID v4'
    }),
  txHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Transaction hash must be a valid 64-character hex string with 0x prefix'
    }),
  confirmations: Joi.number()
    .integer()
    .min(0)
    .max(10000) // Reasonable upper limit
    .required()
    .messages({
      'number.min': 'Confirmations cannot be negative',
      'number.max': 'Confirmations cannot exceed 10,000',
      'number.integer': 'Confirmations must be an integer'
    })
});

const webhookTransactionSchema = Joi.object({
  txHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Transaction hash must be a valid 64-character hex string with 0x prefix'
    }),
  toAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      'string.pattern.base': 'To address must be a valid 40-character hex string with 0x prefix'
    }),
  amount: Joi.number()
    .positive()
    .min(0.000001) // Minimum for blockchain transactions
    .max(1000000000) // Large upper limit for security
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.min': 'Amount too small for blockchain transaction',
      'number.max': 'Amount exceeds maximum allowed value'
    }),
  token: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required()
    .messages({
      'string.pattern.base': 'Token address must be a valid 40-character hex string with 0x prefix'
    })
});

// Additional validation for pagination
const paginationSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .default(50)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 1000',
      'number.integer': 'Limit must be an integer'
    }),
  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.min': 'Offset cannot be negative',
      'number.integer': 'Offset must be an integer'
    }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'expired', 'pending_confirmation')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, expired, pending_confirmation'
    })
});

function validatePaymentRequest(data) {
  return paymentRequestSchema.validate(data, { abortEarly: false });
}

function validateVerificationRequest(data) {
  return verificationRequestSchema.validate(data, { abortEarly: false });
}

function validateWebhookPayment(data) {
  return webhookPaymentSchema.validate(data, { abortEarly: false });
}

function validateWebhookTransaction(data) {
  return webhookTransactionSchema.validate(data, { abortEarly: false });
}

function validatePagination(data) {
  return paginationSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validatePaymentRequest,
  validateVerificationRequest,
  validateWebhookPayment,
  validateWebhookTransaction,
  validatePagination
};