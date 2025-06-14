<?php
/**
 * Contoh Lengkap Integrasi - Crypto Payment Gateway
 * 
 * File ini menunjukkan contoh lengkap integrasi payment gateway
 * dalam aplikasi e-commerce sederhana
 */

class CryptoPaymentGateway {
    private $apiUrl;
    private $apiKey;
    
    public function __construct($apiUrl, $apiKey) {
        $this->apiUrl = rtrim($apiUrl, '/');
        $this->apiKey = $apiKey;
    }
    
    /**
     * Membuat pembayaran baru
     */
    public function createPayment($amount, $orderId, $metadata = []) {
        $data = [
            'amount' => $amount,
            'orderId' => $orderId,
            'metadata' => $metadata
        ];
        
        return $this->makeRequest('POST', '/api/payment/create', $data);
    }
    
    /**
     * Cek status pembayaran
     */
    public function getPaymentStatus($paymentId) {
        return $this->makeRequest('GET', '/api/payment/status/' . $paymentId);
    }
    
    /**
     * Cek saldo wallet
     */
    public function getWalletBalance() {
        return $this->makeRequest('GET', '/api/payment/balance');
    }
    
    /**
     * Membuat API key baru (admin only)
     */
    public function createApiKey($name, $permissions = []) {
        $data = [
            'name' => $name,
            'permissions' => $permissions
        ];
        
        return $this->makeRequest('POST', '/api/keys/create', $data);
    }
    
    /**
     * Helper untuk melakukan HTTP request
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-API-Key: ' . $this->apiKey
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        } else {
            throw new Exception("API Error ($httpCode): " . $response);
        }
    }
}

/**
 * Contoh kelas untuk mengelola pesanan
 */
class OrderManager {
    private $paymentGateway;
    
    public function __construct($paymentGateway) {
        $this->paymentGateway = $paymentGateway;
    }
    
    /**
     * Membuat pesanan baru dengan pembayaran crypto
     */
    public function createOrder($customerData, $items, $totalAmount) {
        // Generate order ID unik
        $orderId = 'ORDER-' . time() . '-' . rand(1000, 9999);
        
        // Simpan order ke database (contoh)
        $this->saveOrderToDatabase($orderId, $customerData, $items, $totalAmount);
        
        // Buat pembayaran
        try {
            $payment = $this->paymentGateway->createPayment(
                $totalAmount,
                $orderId,
                [
                    'customer_email' => $customerData['email'],
                    'customer_name' => $customerData['name'],
                    'items_count' => count($items)
                ]
            );
            
            return [
                'success' => true,
                'orderId' => $orderId,
                'payment' => $payment['data']
            ];
            
        } catch (Exception $e) {
            // Rollback order jika pembayaran gagal
            $this->deleteOrderFromDatabase($orderId);
            throw $e;
        }
    }
    
    /**
     * Memproses konfirmasi pembayaran
     */
    public function confirmPayment($paymentId) {
        try {
            $status = $this->paymentGateway->getPaymentStatus($paymentId);
            $paymentData = $status['data'];
            
            if ($paymentData['status'] === 'completed') {
                // Update status order
                $this->updateOrderStatus($paymentData['orderId'], 'paid');
                
                // Proses fulfillment
                $this->processFulfillment($paymentData['orderId']);
                
                return [
                    'success' => true,
                    'message' => 'Pembayaran berhasil dikonfirmasi',
                    'txHash' => $paymentData['txHash']
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Pembayaran belum selesai',
                    'status' => $paymentData['status']
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Simulasi penyimpanan order ke database
     */
    private function saveOrderToDatabase($orderId, $customerData, $items, $totalAmount) {
        // Implementasi penyimpanan ke database
        error_log("Order saved: $orderId, Amount: $totalAmount USDT");
    }
    
    /**
     * Simulasi hapus order dari database
     */
    private function deleteOrderFromDatabase($orderId) {
        error_log("Order deleted: $orderId");
    }
    
    /**
     * Simulasi update status order
     */
    private function updateOrderStatus($orderId, $status) {
        error_log("Order $orderId status updated to: $status");
    }
    
    /**
     * Simulasi proses fulfillment
     */
    private function processFulfillment($orderId) {
        error_log("Processing fulfillment for order: $orderId");
        // Implementasi: kirim produk, aktivasi layanan, dll
    }
}

// Contoh penggunaan lengkap
try {
    // Inisialisasi payment gateway
    $gateway = new CryptoPaymentGateway(
        'http://localhost:3000',
        'your-api-key-here'
    );
    
    // Inisialisasi order manager
    $orderManager = new OrderManager($gateway);
    
    // Data customer
    $customerData = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890'
    ];
    
    // Items yang dibeli
    $items = [
        ['name' => 'Premium Package', 'price' => 50.00, 'qty' => 1],
        ['name' => 'Extra Features', 'price' => 25.50, 'qty' => 2]
    ];
    
    $totalAmount = 101.00; // 50 + (25.50 * 2)
    
    // Buat order dan pembayaran
    echo "Membuat order baru...\n";
    $result = $orderManager->createOrder($customerData, $items, $totalAmount);
    
    if ($result['success']) {
        echo "Order berhasil dibuat!\n";
        echo "Order ID: " . $result['orderId'] . "\n";
        echo "Payment ID: " . $result['payment']['paymentId'] . "\n";
        echo "Amount: " . $result['payment']['amount'] . " USDT\n";
        echo "Wallet Address: " . $result['payment']['walletAddress'] . "\n";
        echo "QR Code: " . $result['payment']['qrCode'] . "\n";
        echo "Expires At: " . $result['payment']['expiresAt'] . "\n";
        
        // Simulasi pengecekan status pembayaran
        echo "\nMenunggu pembayaran...\n";
        $paymentId = $result['payment']['paymentId'];
        
        // Dalam implementasi nyata, ini akan dipanggil oleh webhook
        // atau polling secara berkala
        sleep(2); // Simulasi delay
        
        $confirmResult = $orderManager->confirmPayment($paymentId);
        echo "Hasil konfirmasi: " . $confirmResult['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
