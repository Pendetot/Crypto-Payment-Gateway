-- Crypto Payment Gateway Database Schema

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    original_amount TEXT NOT NULL,
    amount TEXT NOT NULL,
    order_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    network TEXT DEFAULT 'BSC',
    token TEXT DEFAULT 'USDT',
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    trust_wallet_url TEXT,
    qr_code TEXT,
    metadata TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    verified_at DATETIME
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    permissions TEXT NOT NULL, -- JSON array as string
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME,
    expires_at DATETIME
);

-- Used unique amounts tracking
CREATE TABLE IF NOT EXISTS used_amounts (
    amount TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- Transaction logs
CREATE TABLE IF NOT EXISTS transaction_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id TEXT,
    tx_hash TEXT,
    status TEXT,
    confirmations INTEGER,
    block_number INTEGER,
    gas_used INTEGER,
    gas_price TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_used_amounts_expires ON used_amounts(expires_at);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_payment_id ON transaction_logs(payment_id);
