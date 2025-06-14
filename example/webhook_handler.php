<?php
/**
 * Contoh Webhook Handler - Crypto Payment Gateway
 * 
 * File ini menunjukkan cara menangani webhook dari payment gateway
 */

// Konfigurasi
$webhookSecret = 'your-webhook-secret-here'; // Ganti dengan webhook secret Anda

/**
 * Fungsi untuk memverifikasi signature webhook
 */
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $expectedSignature);
}

/**
 * Fungsi untuk memproses pembayaran yang berhasil
 */
function processSuccessfulPayment($paymentData) {
    // Implementasi logika bisnis Anda di sini
    
    $paymentId = $paymentData['paymentId'];
    $orderId = $paymentData['orderId'];
    $amount = $paymentData['amount'];
    $txHash = $paymentData['txHash'];
    
    // Contoh: Update database
    // updateOrderStatus($orderId, 'paid');
    
    // Contoh: Kirim email konfirmasi
    // sendConfirmationEmail($paymentData);
    
    // Contoh: Aktivasi layanan
    // activateService($orderId);
    
    // Log pembayaran
    error_log("Payment completed: Order $orderId, Amount $amount USDT, TX: $txHash");
    
    return true;
}

/**
 * Fungsi untuk memproses pembayaran yang expired
 */
function processExpiredPayment($paymentData) {
    $paymentId = $paymentData['paymentId'];
    $orderId = $paymentData['orderId'];
    
    // Contoh: Update status order
    // updateOrderStatus($orderId, 'expired');
    
    // Contoh: Kirim notifikasi
    // sendExpirationNotification($paymentData);
    
    error_log("Payment expired: Order $orderId");
    
    return true;
}

// Main webhook handler
try {
    // Ambil raw POST data
    $payload = file_get_contents('php://input');
    
    // Ambil signature dari header
    $signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
    
    // Verifikasi signature
    if (!verifyWebhookSignature($payload, $signature, $webhookSecret)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    // Parse JSON payload
    $data = json_decode($payload, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    
    // Ambil event type dan data
    $eventType = $data['event'] ?? '';
    $paymentData = $data['data'] ?? [];
    
    // Log webhook yang diterima
    error_log("Webhook received: " . $eventType . " for payment " . ($paymentData['paymentId'] ?? 'unknown'));
    
    // Proses berdasarkan event type
    switch ($eventType) {
        case 'payment.completed':
            processSuccessfulPayment($paymentData);
            break;
            
        case 'payment.expired':
            processExpiredPayment($paymentData);
            break;
            
        case 'payment.failed':
            error_log("Payment failed: " . ($paymentData['paymentId'] ?? 'unknown'));
            break;
            
        default:
            error_log("Unknown webhook event: " . $eventType);
            break;
    }
    
    // Kirim response sukses
    http_response_code(200);
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    error_log("Webhook error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Contoh fungsi helper untuk update database
 */
function updateOrderStatus($orderId, $status) {
    // Contoh implementasi dengan PDO
    /*
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=your_db', $username, $password);
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
        $stmt->execute([$status, $orderId]);
        return true;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
    */
    
    // Untuk contoh, hanya log
    error_log("Order $orderId status updated to: $status");
    return true;
}

/**
 * Contoh fungsi untuk kirim email konfirmasi
 */
function sendConfirmationEmail($paymentData) {
    // Implementasi pengiriman email
    /*
    $to = $paymentData['metadata']['email'] ?? '';
    $subject = 'Payment Confirmation - Order ' . $paymentData['orderId'];
    $message = "Your payment has been confirmed. Transaction: " . $paymentData['txHash'];
    
    mail($to, $subject, $message);
    */
    
    error_log("Confirmation email sent for order: " . $paymentData['orderId']);
}
?>
