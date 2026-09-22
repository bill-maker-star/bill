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

$orderId = isset($data['razorpay_order_id']) ? (string) $data['razorpay_order_id'] : '';
$paymentId = isset($data['razorpay_payment_id']) ? (string) $data['razorpay_payment_id'] : '';
$signature = isset($data['razorpay_signature']) ? (string) $data['razorpay_signature'] : '';

if ($orderId === '' || $paymentId === '' || $signature === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing Razorpay payment details.']);
    exit;
}

$expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $razorpayKeySecret);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Payment signature verification failed.']);
    exit;
}

echo json_encode([
    'ok' => true,
    'paymentId' => $paymentId,
    'orderId' => $orderId
]);
