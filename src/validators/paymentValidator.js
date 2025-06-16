const Joi = require('joi');
const { getSupportedNetworks, getSupportedTokens } = require('../config/networks');

const paymentRequestSchema = Joi.object({
  amount: Joi.number().positive().precision(6).required(),
  orderId: Joi.string().alphanum().min(1).max(100).required(),
  network: Joi.string().valid(...getSupportedNetworks()).default('BSC'),
  token: Joi.string().optional().default('USDT'),
  metadata: Joi.object().optional()
}).custom((value, helpers) => {
  // Validate token is supported for the network
  const supportedTokens = getSupportedTokens(value.network);
  if (value.token && !supportedTokens.includes(value.token.toUpperCase()) && 
      value.token.toUpperCase() !== value.network.toUpperCase()) {
    return helpers.error('any.invalid', { 
      message: `Token ${value.token} not supported on ${value.network} network. Supported tokens: ${supportedTokens.join(', ')}` 
    });
  }
  return value;
});

// Dynamic transaction hash validation based on network
const createTxHashValidator = (network) => {
  switch (network?.toUpperCase()) {
    case 'SOL':
    case 'SOLANA':
      // Solana transaction signatures are base58 encoded, typically 87-88 characters
      return Joi.string().pattern(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/).required();
    case 'ETH':
    case 'ETHEREUM':
    case 'BSC':
    case 'POLYGON':
    default:
      // EVM chains use 0x prefixed 64 character hex strings
      return Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required();
  }
};

const verificationRequestSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  txHash: Joi.string().required(),
  network: Joi.string().valid(...getSupportedNetworks()).optional()
}).custom((value, helpers) => {
  // Validate transaction hash format based on network
  const txHashValidator = createTxHashValidator(value.network);
  const { error } = txHashValidator.validate(value.txHash);
  if (error) {
    return helpers.error('any.invalid', { 
      message: `Invalid transaction hash format for ${value.network || 'EVM'} network` 
    });
  }
  return value;
});

const webhookPaymentSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  txHash: Joi.string().required(),
  confirmations: Joi.number().integer().min(0).required(),
  network: Joi.string().valid(...getSupportedNetworks()).optional()
}).custom((value, helpers) => {
  // Validate transaction hash format based on network
  const txHashValidator = createTxHashValidator(value.network);
  const { error } = txHashValidator.validate(value.txHash);
  if (error) {
    return helpers.error('any.invalid', { 
      message: `Invalid transaction hash format for ${value.network || 'EVM'} network` 
    });
  }
  return value;
});

const webhookTransactionSchema = Joi.object({
  txHash: Joi.string().required(),
  toAddress: Joi.string().required(),
  amount: Joi.number().positive().required(),
  token: Joi.string().required(),
  network: Joi.string().valid(...getSupportedNetworks()).optional()
}).custom((value, helpers) => {
  // Validate transaction hash format based on network
  const txHashValidator = createTxHashValidator(value.network);
  const { error } = txHashValidator.validate(value.txHash);
  if (error) {
    return helpers.error('any.invalid', { 
      message: `Invalid transaction hash format for ${value.network || 'EVM'} network` 
    });
  }
  
  // Validate address format based on network
  const network = value.network?.toUpperCase();
  if (network === 'SOL' || network === 'SOLANA') {
    // Solana addresses are base58 encoded, typically 32-44 characters
    const solanaAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressPattern.test(value.toAddress)) {
      return helpers.error('any.invalid', { 
        message: 'Invalid Solana address format' 
      });
    }
    if (!solanaAddressPattern.test(value.token)) {
      return helpers.error('any.invalid', { 
        message: 'Invalid Solana token address format' 
      });
    }
  } else {
    // EVM chains use 0x prefixed 40 character hex strings
    const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    if (!evmAddressPattern.test(value.toAddress)) {
      return helpers.error('any.invalid', { 
        message: 'Invalid EVM address format' 
      });
    }
    if (!evmAddressPattern.test(value.token)) {
      return helpers.error('any.invalid', { 
        message: 'Invalid EVM token address format' 
      });
    }
  }
  
  return value;
});

function validatePaymentRequest(data) {
  return paymentRequestSchema.validate(data);
}

function validateVerificationRequest(data) {
  return verificationRequestSchema.validate(data);
}

function validateWebhookPayment(data) {
  return webhookPaymentSchema.validate(data);
}

function validateWebhookTransaction(data) {
  return webhookTransactionSchema.validate(data);
}

module.exports = {
  validatePaymentRequest,
  validateVerificationRequest,
  validateWebhookPayment,
  validateWebhookTransaction
};
