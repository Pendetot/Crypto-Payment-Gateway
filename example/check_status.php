<?php
/**
 * Contoh Cek Status Pembayaran - Crypto Payment Gateway
 * 
 * File ini menunjukkan cara mengecek status pembayaran
 */

// Konfigurasi API
$apiUrl = 'http://localhost:3000';
$apiKey = 'your-api-key-here'; // Ganti dengan API key Anda

/**
 * Fungsi untuk mengecek status pembayaran
 */
function checkPaymentStatus($paymentId) {
    global $apiUrl, $apiKey;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl . '/api/payment/status/' . $paymentId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    } else {
        throw new Exception('Error checking payment status: ' . $response);
    }
}

/**
 * Fungsi untuk menunggu konfirmasi pembayaran
 */
function waitForPayment($paymentId, $maxWaitTime = 1800) { // 30 menit default
    $startTime = time();
    
    while (time() - $startTime < $maxWaitTime) {
        try {
            $status = checkPaymentStatus($paymentId);
            $paymentStatus = $status['data']['status'];
            
            echo "Status saat ini: " . $paymentStatus . "\n";
            
            if ($paymentStatus === 'completed') {
                return $status;
            } elseif ($paymentStatus === 'expired' || $paymentStatus === 'failed') {
                throw new Exception('Pembayaran gagal atau expired: ' . $paymentStatus);
            }
            
            // Tunggu 10 detik sebelum cek lagi
            sleep(10);
            
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
            break;
        }
    }
    
    throw new Exception('Timeout menunggu pembayaran');
}

// Contoh penggunaan
if ($argc < 2) {
    echo "Usage: php check_status.php <payment_id>\n";
    exit(1);
}

$paymentId = $argv[1];

try {
    echo "Mengecek status pembayaran: " . $paymentId . "\n";
    
    $status = checkPaymentStatus($paymentId);
    
    echo "=== INFORMASI PEMBAYARAN ===\n";
    echo "Payment ID: " . $status['data']['paymentId'] . "\n";
    echo "Order ID: " . $status['data']['orderId'] . "\n";
    echo "Amount: " . $status['data']['amount'] . " USDT\n";
    echo "Status: " . $status['data']['status'] . "\n";
    echo "Created At: " . $status['data']['createdAt'] . "\n";
    
    if (isset($status['data']['txHash'])) {
        echo "Transaction Hash: " . $status['data']['txHash'] . "\n";
        echo "Verified At: " . $status['data']['verifiedAt'] . "\n";
    }
    
    if (isset($status['data']['expiresAt'])) {
        echo "Expires At: " . $status['data']['expiresAt'] . "\n";
    }
    
    // Jika status pending, tawarkan untuk menunggu
    if ($status['data']['status'] === 'pending') {
        echo "\nPembayaran masih pending. Tunggu konfirmasi? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim($line) === 'y') {
            echo "Menunggu konfirmasi pembayaran...\n";
            $finalStatus = waitForPayment($paymentId);
            echo "\nPembayaran berhasil dikonfirmasi!\n";
            echo "Transaction Hash: " . $finalStatus['data']['txHash'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
