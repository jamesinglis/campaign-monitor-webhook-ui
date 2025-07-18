<?php

/**
 * Campaign Monitor API Comprehensive Test Suite
 * 
 * This file performs comprehensive testing of the Campaign Monitor API endpoints
 * using both direct cURL and the application's proxy. It tests multiple API versions,
 * authentication methods, and endpoint patterns to diagnose connectivity issues.
 * 
 * Required environment variables in .env file:
 * - TEST_CLIENT_API_KEY: Your Campaign Monitor client API key
 * - TEST_ACCOUNT_API_KEY: Your Campaign Monitor account API key  
 * - TEST_CLIENT_ID: A valid client ID from your account
 * - TEST_LIST_ID: A valid list ID from your account (optional)
 * 
 * This test validates:
 * - Multiple API versions (v3.1, v3.2, v3.3)
 * - Client-level vs Account-level API keys
 * - Authentication mechanisms and formats
 * - Various endpoint patterns and responses
 * - Webhook endpoint access
 * - Application proxy functionality
 */

require_once __DIR__ . '/vendor/autoload.php';

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

class ApiTester {
    private $baseUrl = 'https://api.createsend.com/api/v3.3';
    
    // Test API keys from environment
    private $clientApiKey;
    private $accountApiKey;
    private $knownClientId;
    
    public function __construct() {
        $this->clientApiKey = $_ENV['TEST_CLIENT_API_KEY'] ?? null;
        $this->accountApiKey = $_ENV['TEST_ACCOUNT_API_KEY'] ?? null;
        $this->knownClientId = $_ENV['TEST_CLIENT_ID'] ?? null;
        
        if (!$this->clientApiKey || !$this->accountApiKey || !$this->knownClientId) {
            echo "❌ ERROR: Missing required environment variables in .env file:\n";
            echo "  - TEST_CLIENT_API_KEY\n";
            echo "  - TEST_ACCOUNT_API_KEY\n";
            echo "  - TEST_CLIENT_ID\n";
            echo "\nPlease create a .env file with these values.\n";
            exit(1);
        }
    }
    
    public function runTests() {
        echo "=== Campaign Monitor API Connectivity Tests ===\n\n";
        
        // Test working endpoint from Postman
        $this->testWorkingEndpoint();
        
        // Test different API versions
        $this->testApiVersions();
        
        // Test different endpoint patterns
        $this->testEndpointPatterns();
        
        echo "Client-level API Key Tests:\n";
        echo "API Key: " . substr($this->clientApiKey, 0, 20) . "...\n";
        echo "Known Client ID: {$this->knownClientId}\n\n";
        
        $this->testClientApiEndpoints();
        
        echo "\n" . str_repeat("=", 50) . "\n\n";
        
        echo "Account-level API Key Tests:\n";
        echo "API Key: {$this->accountApiKey}\n\n";
        
        $this->testAccountApiEndpoints();
        
        echo "\n=== Test Summary ===\n";
        echo "Tests completed. Check results above for connectivity issues.\n";
    }
    
    private function testWorkingEndpoint() {
        echo "Testing working endpoint from Postman (updated to v3.3):\n";
        
        $listId = $_ENV['TEST_LIST_ID'] ?? 'dummy_list_id';
        $endpoint = "/lists/{$listId}/webhooks.json";
        $fullUrl = "https://api.createsend.com/api/v3.3{$endpoint}";
        
        echo "Testing: GET {$endpoint}\n";
        echo "Full URL: {$fullUrl}\n";
        
        // Debug: Show what we're sending
        $encodedAuth = base64_encode($this->clientApiKey . ':x');
        echo "Auth Header: Basic " . substr($encodedAuth, 0, 50) . "...\n\n";
        
        // Test with curl
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $fullUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Authorization: Basic ' . $encodedAuth,
            'User-Agent: CM-API-Tester/1.0'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            echo "🔴 FAILED: cURL Error\n";
            echo "  Error: " . $error . "\n";
        } else if ($httpCode >= 200 && $httpCode < 300) {
            echo "🟢 SUCCESS: Status " . $httpCode . "\n";
            $data = json_decode($response, true);
            if ($data) {
                echo "  Found " . count($data) . " webhooks\n";
                if (!empty($data)) {
                    echo "  Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
                }
            }
        } else {
            echo "🔴 FAILED: Status $httpCode\n";
            echo "  Error: " . substr($response, 0, 200) . "\n";
        }
        
        echo "\n" . str_repeat("=", 50) . "\n\n";
    }
    
    private function testApiVersions() {
        echo "Testing different API versions:\n";
        
        $versions = ['v3.1', 'v3.2', 'v3.3'];
        
        foreach ($versions as $version) {
            echo "Testing $version with client API key:\n";
            
            $fullUrl = "https://api.createsend.com/api/$version/clients.json";
            echo "Full URL: {$fullUrl}\n";
            
            $encodedAuth = base64_encode($this->clientApiKey . ':x');
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Authorization: Basic ' . $encodedAuth,
                'User-Agent: CM-API-Tester/1.0'
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            curl_close($ch);
            
            if ($error) {
                echo "🔴 FAILED: $version - cURL Error\n";
                echo "  Error: " . $error . "\n";
            } else if ($httpCode >= 200 && $httpCode < 300) {
                echo "🟢 SUCCESS: $version works! Status: $httpCode\n";
                $data = json_decode($response, true);
                if ($data) {
                    echo "  Found " . count($data) . " clients\n";
                    if (!empty($data)) {
                        echo "  First client: " . json_encode($data[0], JSON_PRETTY_PRINT) . "\n";
                    }
                }
            } else {
                echo "🔴 FAILED: $version - Status: $httpCode\n";
                echo "  Error: " . substr($response, 0, 200) . "\n";
            }
            echo "\n";
        }
        
        // Test if API key format is correct
        echo "API Key validation:\n";
        echo "Client API Key length: " . strlen($this->clientApiKey) . " chars\n";
        echo "Account API Key length: " . strlen($this->accountApiKey) . " chars\n";
        echo "Client API Key format: " . (preg_match('/^[a-zA-Z0-9+\/=]+$/', $this->clientApiKey) ? 'Valid Base64' : 'Invalid') . "\n";
        echo "Account API Key format: " . (preg_match('/^[a-zA-Z0-9]+$/', $this->accountApiKey) ? 'Valid Hex' : 'Invalid') . "\n";
        echo "\n";
        
        // Test auth without any endpoint (should get 401 for invalid key, 404 for invalid endpoint)
        echo "Testing authentication vs endpoint issues:\n";
        
        $testUrl = "https://api.createsend.com/api/v3.3/clients.json";
        
        // Test with invalid API key to check if we get 401
        $encodedAuth = base64_encode('invalid_key:x');
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $testUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Authorization: Basic ' . $encodedAuth,
            'User-Agent: CM-API-Tester/1.0'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            echo "🟢 Invalid key worked somehow?\n";
        } else {
            echo "Invalid key test - Status: $httpCode (should be 401 for auth error, 404 for endpoint error)\n";
        }
        
        // Test with no authentication
        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $testUrl);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'User-Agent: CM-API-Tester/1.0'
        ]);
        
        $response2 = curl_exec($ch2);
        $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        
        if ($httpCode2 >= 200 && $httpCode2 < 300) {
            echo "🟢 No auth worked somehow?\n";
        } else {
            echo "No auth test - Status: $httpCode2 (should be 401 for missing auth)\n";
        }
        
        echo "\n";
        echo str_repeat("=", 50) . "\n\n";
    }
    
    private function testEndpointPatterns() {
        echo "Testing different endpoint patterns:\n";
        
        // Test different endpoint patterns with v3.3 (using correct documented endpoints)
        
        $patterns = [
            'clients.json' => '/clients.json',              // ✓ Correct: Account-level endpoint
            'billingdetails.json' => '/billingdetails.json', // ✓ Correct: Account-level endpoint
            'countries.json' => '/countries.json',           // ✓ Correct: Account-level endpoint
            'timezones.json' => '/timezones.json',          // ✓ Correct: Account-level endpoint
            'systemdate.json' => '/systemdate.json',        // ✓ Correct: Account-level endpoint
        ];
        
        foreach ($patterns as $description => $endpoint) {
            echo "Testing: $description\n";
            $fullUrl = "https://api.createsend.com/api/v3.3{$endpoint}";
            echo "Full URL: {$fullUrl}\n";
            
            $encodedAuth = base64_encode($this->clientApiKey . ':x');
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Authorization: Basic ' . $encodedAuth,
                'User-Agent: CM-API-Tester/1.0'
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            curl_close($ch);
            
            if ($error) {
                echo "🔴 FAILED: cURL Error\n";
                echo "  Error: " . $error . "\n";
            } else if ($httpCode >= 200 && $httpCode < 300) {
                echo "🟢 SUCCESS: Status $httpCode\n";
                $data = json_decode($response, true);
                if ($data) {
                    echo "  Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
                }
            } else {
                echo "🔴 FAILED: Status $httpCode\n";
                
                if ($httpCode == 401) {
                    echo "  Auth error: " . substr($response, 0, 100) . "\n";
                } else if ($httpCode == 404) {
                    echo "  Not found: " . substr($response, 0, 100) . "\n";
                } else {
                    echo "  Error: " . substr($response, 0, 100) . "\n";
                }
            }
            echo "\n";
        }
        
        echo str_repeat("=", 50) . "\n\n";
    }
    
    private function testClientApiEndpoints() {
        $endpoints = [
            // ✓ Correct: Basic client endpoints
            'GET /clients.json' => '/clients.json',                                          // List all clients (may work for client keys)
            'GET /clients/{clientId}.json' => "/clients/{$this->knownClientId}.json",        // ✓ Correct: Get client details
            'GET /clients/{clientId}/lists.json' => "/clients/{$this->knownClientId}/lists.json", // ✓ Correct: Get client lists
            'GET /clients/{clientId}/segments.json' => "/clients/{$this->knownClientId}/segments.json", // ✓ Correct: Get client segments
            'GET /clients/{clientId}/suppressionlist.json' => "/clients/{$this->knownClientId}/suppressionlist.json", // ✓ Correct: Get suppression list
            'GET /clients/{clientId}/templates.json' => "/clients/{$this->knownClientId}/templates.json", // ✓ Correct: Get templates
            
            // Test webhook endpoints (read-only) - will populate after getting lists
            'GET /lists/{listId}/webhooks.json' => null, // Will populate after getting lists
        ];
        
        foreach ($endpoints as $description => $endpoint) {
            if ($endpoint === null) continue; // Skip for now
            
            echo "Testing: $description\n";
            $fullUrl = $this->baseUrl . $endpoint;
            echo "Full URL: {$fullUrl}\n";
            $result = $this->makeRequest('GET', $endpoint, $this->clientApiKey);
            
            if ($result['success']) {
                echo "🟢 SUCCESS: {$result['status']}\n";
                
                // If this is the lists endpoint, let's test webhook endpoints
                if (strpos($endpoint, '/lists.json') !== false && isset($result['data']) && is_array($result['data'])) {
                    $this->testWebhookEndpoints($result['data'], $this->clientApiKey);
                }
                
                if (isset($result['data'])) {
                    echo "  Response: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
                }
            } else {
                echo "🔴 FAILED: {$result['status']} - {$result['message']}\n";
            }
            echo "\n";
        }
    }
    
    private function testAccountApiEndpoints() {
        $endpoints = [
            'GET /clients.json' => '/clients.json',                 // ✓ Correct: List all clients
            'GET /billingdetails.json' => '/billingdetails.json',   // ✓ Correct: Account billing details
            'GET /countries.json' => '/countries.json',             // ✓ Correct: Valid countries
            'GET /timezones.json' => '/timezones.json',            // ✓ Correct: Valid timezones
            'GET /systemdate.json' => '/systemdate.json',          // ✓ Correct: Current system date
        ];
        
        foreach ($endpoints as $description => $endpoint) {
            echo "Testing: $description\n";
            $fullUrl = $this->baseUrl . $endpoint;
            echo "Full URL: {$fullUrl}\n";
            $result = $this->makeRequest('GET', $endpoint, $this->accountApiKey);
            
            if ($result['success']) {
                echo "🟢 SUCCESS: {$result['status']}\n";
                
                if (isset($result['data'])) {
                    echo "  Response: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
                }
            } else {
                echo "🔴 FAILED: {$result['status']} - {$result['message']}\n";
            }
            echo "\n";
        }
    }
    
    private function testWebhookEndpoints($lists, $apiKey) {
        if (empty($lists)) return;
        
        // Test webhook endpoints for the first list only
        $firstList = $lists[0];
        $listId = $firstList['ListID'];
        
        echo "Testing webhook endpoints for list: {$firstList['Name']} ({$listId})\n";
        
        $webhookEndpoint = "/lists/{$listId}/webhooks.json";
        echo "Testing: GET {$webhookEndpoint}\n";
        
        $result = $this->makeRequest('GET', $webhookEndpoint, $apiKey);
        
        if ($result['success']) {
            echo "🟢 SUCCESS: {$result['status']}\n";
            if (isset($result['data'])) {
                echo "  Webhooks found: " . count($result['data']) . "\n";
                if (!empty($result['data'])) {
                    echo "  First webhook: " . json_encode($result['data'][0], JSON_PRETTY_PRINT) . "\n";
                }
            }
        } else {
            echo "🔴 FAILED: {$result['status']} - {$result['message']}\n";
        }
        echo "\n";
    }
    
    private function makeRequest($method, $endpoint, $apiKey) {
        try {
            // Use curl instead of Guzzle for better compatibility
            $encodedAuth = base64_encode($apiKey . ':x');
            $fullUrl = $this->baseUrl . $endpoint;
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Authorization: Basic ' . $encodedAuth,
                'User-Agent: CM-API-Tester/1.0'
            ]);
            
            if ($method !== 'GET') {
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            }
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            curl_close($ch);
            
            if ($error) {
                return [
                    'success' => false,
                    'status' => 'cURL Error',
                    'data' => null,
                    'message' => $error
                ];
            }
            
            $data = json_decode($response, true);
            
            return [
                'success' => $httpCode >= 200 && $httpCode < 300,
                'status' => $httpCode,
                'data' => $data,
                'message' => $httpCode >= 200 && $httpCode < 300 ? 'OK' : $response
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'status' => 'Exception',
                'data' => null,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function testProxyEndpoints() {
        echo "\n=== Testing Proxy Endpoints ===\n\n";
        
        $proxyBase = 'http://localhost:8000/api/proxy.php';
        
        $endpoints = [
            'GET /clients.json' => 'clients.json',
            'GET /clients/{clientId}.json' => "clients/{$this->knownClientId}.json",
            'GET /clients/{clientId}/lists.json' => "clients/{$this->knownClientId}/lists.json",
        ];
        
        foreach ($endpoints as $description => $path) {
            echo "Testing proxy: $description\n";
            
            // Test with client API key
            $result = $this->makeProxyRequest($proxyBase, $path, $this->clientApiKey);
            
            if ($result['success']) {
                echo "✓ SUCCESS: {$result['status']}\n";
                if (isset($result['data'])) {
                    echo "  Response: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
                }
            } else {
                echo "✗ FAILED: {$result['status']} - {$result['message']}\n";
            }
            echo "\n";
        }
    }
    
    private function makeProxyRequest($proxyBase, $path, $apiKey) {
        try {
            $url = $proxyBase . '?path=' . urlencode($path);
            $encodedAuth = base64_encode($apiKey . ':x');
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Authorization: Basic ' . $encodedAuth,
                'Content-Type: application/json'
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            curl_close($ch);
            
            if ($error) {
                return [
                    'success' => false,
                    'status' => 'cURL Error',
                    'data' => null,
                    'message' => $error
                ];
            }
            
            $data = json_decode($response, true);
            
            return [
                'success' => $httpCode >= 200 && $httpCode < 300,
                'status' => $httpCode,
                'data' => $data,
                'message' => $httpCode >= 200 && $httpCode < 300 ? 'OK' : $response
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'status' => 'Exception',
                'data' => null,
                'message' => $e->getMessage()
            ];
        }
    }
}

// Run the tests
$tester = new ApiTester();
$tester->runTests();

// Uncomment to test proxy endpoints (requires DDEV running)
// $tester->testProxyEndpoints();