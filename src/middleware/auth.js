const crypto = require('crypto');
const databaseService = require('../services/databaseService');
const { v4: uuidv4 } = require('uuid');

const apiKeys = new Map();

function generateAPIKey() {
  return crypto.randomBytes(32).toString('hex');
}

async function initializeAPIKey() {
  const defaultKey = process.env.API_KEY || generateAPIKey();
  const keyHash = crypto.createHash('sha256').update(defaultKey).digest('hex');
  
  try {
    // Check if default key exists in database
    const existingKey = await databaseService.getApiKey(keyHash);
    
    if (!existingKey) {
      // Create default key in database
      await databaseService.createApiKey({
        id: uuidv4(),
        name: 'Default Admin Key',
        keyHash: keyHash,
        permissions: ['admin', 'payment:create', 'payment:verify', 'payment:status', 'payment:balance'],
        isActive: true
      });
      
      if (!process.env.API_KEY) {
        console.log('⚠️  No API_KEY found in environment variables');
        console.log(`🔑 Generated API Key: ${defaultKey}`);
        console.log('📝 Add this to your .env file: API_KEY=' + defaultKey);
      }
    }
  } catch (error) {
    console.error('Error initializing API key:', error);
    // Fallback to in-memory storage
    apiKeys.set(defaultKey, {
      key: defaultKey,
      name: 'Default Admin Key',
      permissions: ['admin', 'payment:create', 'payment:verify', 'payment:status', 'payment:balance'],
      createdAt: new Date(),
      lastUsed: null,
      isActive: true
    });
  }
  
  return defaultKey;
}

async function addAPIKey(name, permissions = ['payment:create', 'payment:verify', 'payment:status']) {
  const key = generateAPIKey();
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  
  try {
    await databaseService.createApiKey({
      id: uuidv4(),
      name,
      keyHash: keyHash,
      permissions,
      isActive: true
    });
    return key;
  } catch (error) {
    console.error('Error creating API key:', error);
    // Fallback to in-memory storage
    apiKeys.set(key, {
      key,
      name,
      permissions,
      createdAt: new Date(),
      lastUsed: null,
      isActive: true
    });
    return key;
  }
}

async function revokeAPIKey(key) {
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  
  try {
    const result = await databaseService.revokeApiKey(keyHash);
    return result.changes > 0;
  } catch (error) {
    console.error('Error revoking API key:', error);
    // Fallback to in-memory storage
    const keyData = apiKeys.get(key);
    if (keyData) {
      keyData.isActive = false;
      return true;
    }
    return false;
  }
}

async function listAPIKeys() {
  try {
    const keys = await databaseService.getAllApiKeys();
    return keys.map(key => ({
      id: key.keyHash.substring(0, 8) + '...',
      name: key.name,
      permissions: key.permissions,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive
    }));
  } catch (error) {
    console.error('Error listing API keys:', error);
    // Fallback to in-memory storage
    const keys = [];
    for (const [key, data] of apiKeys) {
      keys.push({
        id: key.substring(0, 8) + '...',
        name: data.name,
        permissions: data.permissions,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        isActive: data.isActive
      });
    }
    return keys;
  }
}

function authenticateAPI(requiredPermission = null) {
  return async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required',
        message: 'Provide API key in X-API-Key header or Authorization: Bearer <key>'
      });
    }

    try {
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      let keyData = await databaseService.getApiKey(keyHash);
      
      // Fallback to in-memory storage if database fails
      if (!keyData) {
        keyData = apiKeys.get(apiKey);
      }
      
      if (!keyData || !keyData.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive API key'
        });
      }

      if (requiredPermission && !keyData.permissions.includes(requiredPermission) && !keyData.permissions.includes('admin')) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: requiredPermission
        });
      }

      // Update last used timestamp
      try {
        await databaseService.updateApiKeyLastUsed(keyHash);
      } catch (error) {
        console.error('Error updating API key last used:', error);
        // Update in-memory fallback
        if (apiKeys.has(apiKey)) {
          apiKeys.get(apiKey).lastUsed = new Date();
        }
      }
      
      req.apiKey = keyData;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication service error'
      });
    }
  };
}

function requireAdmin(req, res, next) {
  if (!req.apiKey?.permissions.includes('admin')) {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
  }
  next();
}

const apiKeyRateLimits = new Map();

function rateLimitByAPIKey(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const key = req.apiKey.keyHash || req.apiKey.key || req.apiKey.id;
    const now = Date.now();
    
    if (!apiKeyRateLimits.has(key)) {
      apiKeyRateLimits.set(key, {
        requests: [],
        windowStart: now
      });
    }

    const keyLimits = apiKeyRateLimits.get(key);
    
    keyLimits.requests = keyLimits.requests.filter(time => now - time < windowMs);
    
    if (keyLimits.requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded for this API key',
        resetTime: new Date(keyLimits.requests[0] + windowMs)
      });
    }

    keyLimits.requests.push(now);
    next();
  };
}

let defaultAPIKey;

// Function to get default API key (will be called after database is ready)
async function getDefaultAPIKey() {
  if (!defaultAPIKey) {
    defaultAPIKey = await initializeAPIKey();
  }
  return defaultAPIKey;
}

module.exports = {
  authenticateAPI,
  requireAdmin,
  rateLimitByAPIKey,
  generateAPIKey,
  addAPIKey,
  revokeAPIKey,
  listAPIKeys,
  getDefaultAPIKey,
  get defaultAPIKey() { return defaultAPIKey; }
};
