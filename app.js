require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const paymentRoutes = require('./src/routes/payment');
const webhookRoutes = require('./src/routes/webhook');
const apiKeyRoutes = require('./src/routes/apiKeys');
const sandboxRoutes = require('./src/routes/sandbox');
const emailRoutes = require('./src/routes/email');

const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { authenticateAPI, getDefaultAPIKey } = require('./src/middleware/auth');
const PaymentServiceFactory = require('./src/services/paymentServiceFactory');
const databaseService = require('./src/services/databaseService');

const app = express();

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, 
  message: {
    success: false,
    error: 'Too many requests from this IP address',
    retryAfter: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Webhook-Signature']
}));

app.use(morgan('combined', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}));

app.use(limiter);

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/email', emailRoutes);

app.get('/health', (req, res) => {
  const envInfo = PaymentServiceFactory.getEnvironmentInfo();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    paymentService: envInfo
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Multi-Network Crypto Payment Gateway API',
      version: '2.0.0',
      description: 'API for processing cryptocurrency payments on multiple networks (BSC, Ethereum, Solana)',
      authentication: {
        type: 'API Key',
        header: 'X-API-Key',
        alternative: 'Authorization: Bearer <api-key>'
      },
      endpoints: {
        payment: {
          'POST /api/payment/create': {
            description: 'Create new payment',
            permission: 'payment:create',
            body: {
              amount: 'number (required)',
              orderId: 'string (required)',
              network: 'string (optional, default: BSC) - BSC, ETH, SOL',
              token: 'string (optional, default: USDT) - Token symbol',
              metadata: 'object (optional)'
            }
          },
          'POST /api/payment/verify': {
            description: 'Verify payment with transaction hash',
            permission: 'payment:verify',
            body: {
              paymentId: 'string (required)',
              txHash: 'string (required)',
              network: 'string (optional) - Network for validation'
            }
          },
          'GET /api/payment/status/:paymentId': {
            description: 'Get payment status',
            permission: 'payment:status'
          },
          'GET /api/payment/balance': {
            description: 'Get wallet balance',
            permission: 'payment:balance'
          },
          'GET /api/payment/list': {
            description: 'List payments (Admin only)',
            permission: 'admin',
            query: {
              status: 'string (optional) - Filter by status',
              network: 'string (optional) - Filter by network',
              limit: 'number (optional, default: 50)',
              offset: 'number (optional, default: 0)'
            }
          },
          'GET /api/payment/networks': {
            description: 'Get supported networks and tokens',
            permission: 'payment:status'
          }
        },
        apiKeys: {
          'POST /api/keys/create': {
            description: 'Create new API key (Admin only)',
            permission: 'admin'
          },
          'GET /api/keys/list': {
            description: 'List API keys (Admin only)',
            permission: 'admin'
          },
          'POST /api/keys/revoke': {
            description: 'Revoke API key (Admin only)',
            permission: 'admin'
          },
          'GET /api/keys/info': {
            description: 'Get current API key info',
            permission: 'any'
          }
        },
        sandbox: PaymentServiceFactory.isSandboxMode() ? {
          'GET /api/sandbox/info': {
            description: 'Get sandbox environment information',
            permission: 'any'
          },
          'POST /api/sandbox/simulate/:paymentId': {
            description: 'Simulate payment completion',
            permission: 'payment:verify'
          },
          'GET /api/sandbox/payments': {
            description: 'Get all sandbox payments',
            permission: 'admin'
          },
          'DELETE /api/sandbox/payments': {
            description: 'Clear all sandbox payments',
            permission: 'admin'
          },
          'POST /api/sandbox/test-payment': {
            description: 'Create test payment with scenarios',
            permission: 'payment:create'
          }
        } : undefined,
        email: {
          'POST /api/email/test': {
            description: 'Send test email (Admin only)',
            permission: 'admin',
            body: {
              email: 'string (required)'
            }
          },
          'POST /api/email/payment-created': {
            description: 'Send payment created notification',
            permission: 'payment:create',
            body: {
              email: 'string (required)',
              paymentData: 'object (required)'
            }
          },
          'POST /api/email/payment-success': {
            description: 'Send payment success notification',
            permission: 'payment:verify',
            body: {
              email: 'string (required)',
              paymentData: 'object (required)'
            }
          },
          'POST /api/email/payment-expired': {
            description: 'Send payment expired notification',
            permission: 'payment:create',
            body: {
              email: 'string (required)',
              paymentData: 'object (required)'
            }
          },
          'GET /api/email/status': {
            description: 'Get email service status (Admin only)',
            permission: 'admin'
          }
        }
      },
      permissions: [
        'payment:create - Create new payments',
        'payment:verify - Verify payments',
        'payment:status - Check payment status',
        'payment:balance - View wallet balance',
        'admin - Full access to all endpoints'
      ],
      environment: PaymentServiceFactory.getEnvironmentInfo()
    }
  });
});

app.get('/api/auth/test', authenticateAPI(), (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    data: {
      keyName: req.apiKey.name,
      permissions: req.apiKey.permissions,
      lastUsed: req.apiKey.lastUsed
    }
  });
});

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize database before starting server
async function startServer() {
  try {
    // Initialize database
    await databaseService.initialize();
    
    // Initialize API key after database is ready
    const defaultAPIKey = await getDefaultAPIKey();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🔑 Default API Key: ${defaultAPIKey}`);
      console.log(`💡 Add API_KEY=${defaultAPIKey} to your .env file`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await databaseService.close();
      server.close(() => {
        console.log('Process terminated');
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      await databaseService.close();
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
