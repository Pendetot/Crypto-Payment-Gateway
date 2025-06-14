const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'crypto_payment_gateway.db');
    this.schemaPath = path.join(__dirname, '../database/schema.sql');
  }

  async initialize() {
    try {
      // Create database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          throw err;
        }
        console.log(`📁 SQLite database connected: ${this.dbPath}`);
      });

      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');
      
      // Create tables from schema
      await this.createTables();
      
      // Clean expired data on startup
      await this.cleanExpiredData();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      const schema = fs.readFileSync(this.schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await this.run(statement);
        }
      }
      
      console.log('📋 Database tables created/verified');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async cleanExpiredData() {
    try {
      // Clean expired used amounts
      await this.run('DELETE FROM used_amounts WHERE expires_at < datetime("now")');
      
      // Clean old expired payments (older than 7 days)
      await this.run(`
        DELETE FROM payments 
        WHERE status = 'expired' 
        AND created_at < datetime('now', '-7 days')
      `);
      
      console.log('🧹 Expired data cleaned');
    } catch (error) {
      console.error('Error cleaning expired data:', error);
    }
  }

  // Promisify database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Payment operations
  async createPayment(paymentData) {
    const sql = `
      INSERT INTO payments (
        id, original_amount, amount, order_id, wallet_address, 
        contract_address, network, token, status, trust_wallet_url, 
        qr_code, metadata, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      paymentData.id,
      paymentData.originalAmount,
      paymentData.amount,
      paymentData.orderId,
      paymentData.walletAddress,
      paymentData.contractAddress,
      paymentData.network,
      paymentData.token,
      paymentData.status,
      paymentData.trustWalletUrl,
      paymentData.qrCode,
      JSON.stringify(paymentData.metadata),
      paymentData.expiresAt.toISOString()
    ];
    
    return await this.run(sql, params);
  }

  async getPayment(paymentId) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const row = await this.get(sql, [paymentId]);
    
    if (row) {
      return this.formatPaymentRow(row);
    }
    return null;
  }

  async updatePayment(paymentId, updates) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE payments SET ${setClause} WHERE id = ?`;
    const params = [...Object.values(updates), paymentId];
    
    return await this.run(sql, params);
  }

  async findPaymentByAmount(amount) {
    const sql = 'SELECT * FROM payments WHERE amount = ? AND status = "pending"';
    const row = await this.get(sql, [amount.toString()]);
    
    if (row) {
      return this.formatPaymentRow(row);
    }
    return null;
  }

  async getAllPayments(status = null) {
    let sql = 'SELECT * FROM payments';
    let params = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params = [status];
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = await this.all(sql, params);
    return rows.map(row => this.formatPaymentRow(row));
  }

  formatPaymentRow(row) {
    return {
      id: row.id,
      originalAmount: row.original_amount,
      amount: row.amount,
      orderId: row.order_id,
      walletAddress: row.wallet_address,
      contractAddress: row.contract_address,
      network: row.network,
      token: row.token,
      status: row.status,
      txHash: row.tx_hash,
      confirmations: row.confirmations,
      trustWalletUrl: row.trust_wallet_url,
      qrCode: row.qr_code,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      verifiedAt: row.verified_at ? new Date(row.verified_at) : null
    };
  }

  // Used amounts operations
  async addUsedAmount(amount, expiresAt) {
    const sql = 'INSERT OR REPLACE INTO used_amounts (amount, expires_at) VALUES (?, ?)';
    return await this.run(sql, [amount.toString(), expiresAt.toISOString()]);
  }

  async isAmountUsed(amount) {
    const sql = 'SELECT 1 FROM used_amounts WHERE amount = ? AND expires_at > datetime("now")';
    const row = await this.get(sql, [amount.toString()]);
    return !!row;
  }

  async removeUsedAmount(amount) {
    const sql = 'DELETE FROM used_amounts WHERE amount = ?';
    return await this.run(sql, [amount.toString()]);
  }

  // API Key operations
  async createApiKey(keyData) {
    const sql = `
      INSERT INTO api_keys (id, name, key_hash, permissions, is_active, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      keyData.id,
      keyData.name,
      keyData.keyHash,
      JSON.stringify(keyData.permissions),
      keyData.isActive ? 1 : 0,
      keyData.expiresAt ? keyData.expiresAt.toISOString() : null
    ];
    
    return await this.run(sql, params);
  }

  async getApiKey(keyHash) {
    const sql = 'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1';
    const row = await this.get(sql, [keyHash]);
    
    if (row) {
      return {
        id: row.id,
        name: row.name,
        keyHash: row.key_hash,
        permissions: JSON.parse(row.permissions),
        isActive: !!row.is_active,
        createdAt: new Date(row.created_at),
        lastUsed: row.last_used ? new Date(row.last_used) : null,
        expiresAt: row.expires_at ? new Date(row.expires_at) : null
      };
    }
    return null;
  }

  async updateApiKeyLastUsed(keyHash) {
    const sql = 'UPDATE api_keys SET last_used = datetime("now") WHERE key_hash = ?';
    return await this.run(sql, [keyHash]);
  }

  async getAllApiKeys() {
    const sql = 'SELECT * FROM api_keys ORDER BY created_at DESC';
    const rows = await this.all(sql);
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      keyHash: row.key_hash,
      permissions: JSON.parse(row.permissions),
      isActive: !!row.is_active,
      createdAt: new Date(row.created_at),
      lastUsed: row.last_used ? new Date(row.last_used) : null,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null
    }));
  }

  async revokeApiKey(keyHash) {
    const sql = 'UPDATE api_keys SET is_active = 0 WHERE key_hash = ?';
    return await this.run(sql, [keyHash]);
  }

  // Transaction log operations
  async logTransaction(logData) {
    const sql = `
      INSERT INTO transaction_logs (
        payment_id, tx_hash, status, confirmations, 
        block_number, gas_used, gas_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      logData.paymentId,
      logData.txHash,
      logData.status,
      logData.confirmations,
      logData.blockNumber,
      logData.gasUsed,
      logData.gasPrice
    ];
    
    return await this.run(sql, params);
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('📁 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new DatabaseService();
