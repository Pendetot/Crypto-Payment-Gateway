<?php
/**
 * Contoh Membuat Pembayaran - Crypto Payment Gateway
 * 
 * File ini menunjukkan cara membuat pembayaran baru menggunakan API
 */

// Konfigurasi API
$apiUrl = 'http://localhost:3000';
$apiKey = 'your-api-key-here'; // Ganti dengan API key Anda

/**
 * Fungsi untuk membuat pembayaran baru
 */
function createPayment($amount, $orderId, $metadata = []) {
    global $apiUrl, $apiKey;
    
    $data = [
        'amount' => $amount,
        'orderId' => $orderId,
        'metadata' => $metadata
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl . '/api/payment/create');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    } else {
        throw new Exception('Error creating payment: ' . $response);
    }
}

// Contoh penggunaan
try {
    $payment = createPayment(
        100.50,           // Jumlah dalam USDT
        'ORDER-' . time(), // Order ID unik
        [                 // Metadata opsional
            'customer_id' => 12345,
            'product' => 'Premium Package',
            'email' => 'customer@example.com'
        ]
    );
    
    echo "Pembayaran berhasil dibuat!\n";
    echo "Payment ID: " . $payment['data']['paymentId'] . "\n";
    echo "Amount: " . $payment['data']['amount'] . " USDT\n";
    echo "Wallet Address: " . $payment['data']['walletAddress'] . "\n";
    echo "QR Code: " . $payment['data']['qrCode'] . "\n";
    echo "Expires At: " . $payment['data']['expiresAt'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
