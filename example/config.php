<?php
/**
 * Konfigurasi - Crypto Payment Gateway
 * 
 * File konfigurasi untuk contoh-contoh PHP
 */

// Konfigurasi API
define('API_URL', 'http://localhost:3000');
define('API_KEY', 'your-api-key-here');
define('WEBHOOK_SECRET', 'your-webhook-secret-here');

// Konfigurasi Database (opsional)
define('DB_HOST', 'localhost');
define('DB_NAME', 'crypto_payment');
define('DB_USER', 'username');
define('DB_PASS', 'password');

// Konfigurasi Email (opsional)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');

// Konfigurasi Aplikasi
define('PAYMENT_TIMEOUT', 1800); // 30 menit
define('MIN_PAYMENT_AMOUNT', 1.0); // Minimum 1 USDT
define('MAX_PAYMENT_AMOUNT', 10000.0); // Maximum 10,000 USDT

// Environment
define('ENVIRONMENT', 'development'); // development, production, sandbox

/**
 * Fungsi helper untuk mendapatkan konfigurasi berdasarkan environment
 */
function getConfig($key, $default = null) {
    $configs = [
        'development' => [
            'api_url' => 'http://localhost:3000',
            'debug' => true,
            'log_level' => 'debug'
        ],
        'production' => [
            'api_url' => 'https://your-domain.com',
            'debug' => false,
            'log_level' => 'error'
        ],
        'sandbox' => [
            'api_url' => 'http://localhost:3000',
            'debug' => true,
            'log_level' => 'debug'
        ]
    ];
    
    $env = ENVIRONMENT;
    return $configs[$env][$key] ?? $default;
}

/**
 * Fungsi untuk logging
 */
function logMessage($message, $level = 'info') {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
    
    // Log ke file
    file_put_contents('payment_gateway.log', $logEntry, FILE_APPEND | LOCK_EX);
    
    // Log ke error_log jika debug mode
    if (getConfig('debug', false)) {
        error_log($logEntry);
    }
}

/**
 * Fungsi untuk validasi API key
 */
function validateApiKey($apiKey) {
    // Validasi format API key (contoh: 64 karakter hex)
    return preg_match('/^[a-f0-9]{64}$/', $apiKey);
}

/**
 * Fungsi untuk format amount
 */
function formatAmount($amount) {
    return number_format($amount, 2, '.', '');
}

/**
 * Fungsi untuk validasi email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Fungsi untuk generate order ID
 */
function generateOrderId($prefix = 'ORDER') {
    return $prefix . '-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -8));
}

/**
 * Fungsi untuk konversi timestamp
 */
function formatTimestamp($timestamp) {
    return date('Y-m-d H:i:s', strtotime($timestamp));
}

/**
 * Fungsi untuk cek apakah dalam mode sandbox
 */
function isSandboxMode() {
    return ENVIRONMENT === 'sandbox' || getenv('NODE_ENV') === 'sandbox';
}

/**
 * Fungsi untuk mendapatkan base URL
 */
function getBaseUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $protocol . '://' . $host;
}

/**
 * Fungsi untuk response JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Fungsi untuk error handling
 */
function handleError($message, $code = 500) {
    logMessage("Error: $message", 'error');
    jsonResponse(['error' => $message], $code);
}

// Auto-load konfigurasi dari file .env jika ada
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}
?>
