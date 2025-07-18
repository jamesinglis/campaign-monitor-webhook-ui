<?php

/**
 * Campaign Monitor API Direct cURL Test
 * 
 * This file tests the exact cURL commands that work with the Campaign Monitor API
 * using direct HTTP requests (no PHP wrapper library). This is useful for debugging
 * authentication and endpoint issues.
 * 
 * Required environment variables in .env file:
 * - TEST_CLIENT_API_KEY: Your Campaign Monitor client API key
 * - TEST_CLIENT_ID: A valid client ID from your account
 * - TEST_LIST_ID: A valid list ID from your account
 * 
 * This test validates:
 * - Direct webhook endpoint access
 * - Client lists endpoint access
 * - Basic authentication with API keys
 * - HTTP response codes and data
 */

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $envFile = __DIR__ . '/.env';
    $envLines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Get values from environment
$apiKey = $_ENV['TEST_CLIENT_API_KEY'] ?? null;
$clientId = $_ENV['TEST_CLIENT_ID'] ?? null;
$listId = $_ENV['TEST_LIST_ID'] ?? null;

if (!$apiKey || !$clientId || !$listId) {
    echo "❌ ERROR: Missing required environment variables in .env file:\n";
    echo "  - TEST_CLIENT_API_KEY\n";
    echo "  - TEST_CLIENT_ID\n";
    echo "  - TEST_LIST_ID\n";
    echo "\nPlease create a .env file with these values.\n";
    exit(1);
}

// Test exact curl command that works
$encodedAuth = base64_encode($apiKey . ':x');

echo "=== Testing Exact Curl Command ===\n";
echo "API Key: " . substr($apiKey, 0, 20) . "...\n";
echo "Encoded Auth: " . substr($encodedAuth, 0, 50) . "...\n\n";

$url = "https://api.createsend.com/api/v3.2/lists/{$listId}/webhooks.json";

echo "Testing URL: $url\n";

// Use curl directly
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Basic ' . $encodedAuth
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

if ($error) {
    echo "🔴 FAILED: cURL Error\n";
    echo "  Error: $error\n";
} else if ($httpCode >= 200 && $httpCode < 300) {
    echo "🟢 SUCCESS: HTTP Status $httpCode\n";
    $data = json_decode($response, true);
    if ($data && is_array($data)) {
        echo "  Found " . count($data) . " webhooks\n";
        if (!empty($data)) {
            echo "  Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "  Response: $response\n";
    }
} else {
    echo "🔴 FAILED: HTTP Status $httpCode\n";
    echo "  Error: " . substr($response, 0, 200) . "\n";
}

curl_close($ch);

// Test client lists endpoint
echo "\n" . str_repeat("=", 50) . "\n";
echo "Testing Client Lists Endpoint\n";

$url2 = "https://api.createsend.com/api/v3.2/clients/$clientId/lists.json";

echo "Testing URL: $url2\n";

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, $url2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Basic ' . $encodedAuth
]);
curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);

$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$error2 = curl_error($ch2);

if ($error2) {
    echo "🔴 FAILED: cURL Error\n";
    echo "  Error: $error2\n";
} else if ($httpCode2 >= 200 && $httpCode2 < 300) {
    echo "🟢 SUCCESS: HTTP Status $httpCode2\n";
    $data2 = json_decode($response2, true);
    if ($data2 && is_array($data2)) {
        echo "  Found " . count($data2) . " lists\n";
        if (!empty($data2)) {
            echo "  First list: " . json_encode($data2[0], JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "  Response: $response2\n";
    }
} else {
    echo "🔴 FAILED: HTTP Status $httpCode2\n";
    echo "  Error: " . substr($response2, 0, 200) . "\n";
}

curl_close($ch2);

?>