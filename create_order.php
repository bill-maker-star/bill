<?php
header('Content-Type: application/json');

require __DIR__ . DIRECTORY_SEPARATOR . 'razorpay_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

require_razorpay_config();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$amount = isset($data['amount']) ? (float) $data['amount'] : 0;
$billNumber = isset($data['billNumber']) ? (string) $data['billNumber'] : '0001';
$customerName = isset($data['customerName']) ? (string) $data['customerName'] : 'Walk-in';
$amountInPaise = (int) round($amount * 100);

if ($amountInPaise < 100) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Amount must be at least Rs. 1.']);
    exit;
}

$receipt = substr(preg_replace('/[^a-zA-Z0-9_-]/', '_', 'bill_' . $billNumber), 0, 40);
$payload = json_encode([
    'amount' => $amountInPaise,
    'currency' => $razorpayCurrency,
    'receipt' => $receipt,
    'notes' => [
        'bill_number' => $billNumber,
        'customer_name' => $customerName
    ]
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_USERPWD => $razorpayKeyId . ':' . $razorpayKeySecret,
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Razorpay request failed: ' . $curlError]);
    exit;
}

$order = json_decode($response, true);
if ($statusCode < 200 || $statusCode >= 300 || !isset($order['id'])) {
    http_response_code(502);
    $message = $order['error']['description'] ?? 'Unable to create Razorpay order.';
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

echo json_encode([
    'ok' => true,
    'keyId' => $razorpayKeyId,
    'orderId' => $order['id'],
    'amount' => $order['amount'],
    'currency' => $order['currency']
]);
