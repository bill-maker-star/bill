<?php
function razorpay_env_value($name) {
    $value = getenv($name);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$name]) && $_ENV[$name] !== '') {
        return $_ENV[$name];
    }

    return '';
}

$localConfig = __DIR__ . DIRECTORY_SEPARATOR . 'razorpay_local_config.php';
if (is_file($localConfig)) {
    require $localConfig;
}

$razorpayKeyId = defined('RAZORPAY_KEY_ID') ? RAZORPAY_KEY_ID : razorpay_env_value('RAZORPAY_KEY_ID');
$razorpayKeySecret = defined('RAZORPAY_KEY_SECRET') ? RAZORPAY_KEY_SECRET : razorpay_env_value('RAZORPAY_KEY_SECRET');
$razorpayCurrency = defined('RAZORPAY_CURRENCY') ? RAZORPAY_CURRENCY : (razorpay_env_value('RAZORPAY_CURRENCY') ?: 'INR');

function require_razorpay_config() {
    global $razorpayKeyId, $razorpayKeySecret;

    if ($razorpayKeyId === '' || $razorpayKeySecret === '') {
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'error' => 'Razorpay keys are not configured on the server.'
        ]);
        exit;
    }
}
