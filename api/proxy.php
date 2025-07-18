<?php

class ApiProxy {
    private $baseUrl;
    private $allowedPaths = [
        // Account-level endpoints
        'clients.json',
        'billingdetails.json',
        'countries.json',
        'timezones.json',
        'systemdate.json',
        
        // Client-level endpoints
        'clients/*.json',
        'clients/*/lists.json',
        'clients/*/segments.json',
        'clients/*/suppressionlist.json',
        'clients/*/templates.json',
        
        // List-level endpoints
        'lists/*.json',
        'lists/*/stats.json',
        'lists/*/customfields.json',
        'lists/*/segments.json',
        'lists/*/webhooks.json',
        'lists/*/webhooks/*.json'
    ];
    
    public function __construct() {
        $this->baseUrl = $_ENV['CM_API_BASE_URL'] ?? 'https://api.createsend.com/api/v3.3';
    }
    
    public function handleRequest() {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        // Get request data
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_GET['path'] ?? '';
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        // Validate path
        if (!$this->isPathAllowed($path)) {
            $this->sendError(403, 'Path not allowed');
            return;
        }
        
        // Validate API key
        if (empty($authHeader)) {
            $this->sendError(401, 'API key required');
            return;
        }
        
        // Extract API key from Basic auth header
        if (strpos($authHeader, 'Basic ') === 0) {
            $basicAuth = substr($authHeader, 6);
            $decoded = base64_decode($basicAuth);
            $apiKey = explode(':', $decoded)[0];
        } else {
            // Fallback for Bearer token (remove 'Bearer ' prefix)
            $apiKey = str_replace('Bearer ', '', $authHeader);
        }
        
        // Validate API key format (basic validation)
        if (strlen($apiKey) < 20 || !preg_match('/^[a-zA-Z0-9+\/=]+$/', $apiKey)) {
            $this->sendError(401, 'Invalid API key format');
            return;
        }
        
        try {
            // Use curl directly instead of Guzzle due to compatibility issues
            $encodedAuth = base64_encode($apiKey . ':x');
            $fullUrl = $this->baseUrl . '/' . $path;
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Authorization: Basic ' . $encodedAuth,
                'User-Agent: CM-Webhook-Manager/1.0'
            ]);
            
            // Handle POST/PUT requests with body
            if (in_array($method, ['POST', 'PUT'])) {
                $body = file_get_contents('php://input');
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
                
                if ($body) {
                    // Validate JSON for POST/PUT requests
                    $decoded = json_decode($body, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        curl_close($ch);
                        $this->sendError(400, 'Invalid JSON in request body');
                        return;
                    }
                    
                    // Additional validation for webhook data
                    if ($method === 'POST' && strpos($path, '/webhooks') !== false) {
                        $validationErrors = $this->validateWebhookData($decoded);
                        if (!empty($validationErrors)) {
                            curl_close($ch);
                            $this->sendError(400, 'Validation failed: ' . implode(', ', $validationErrors));
                            return;
                        }
                    }
                    
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Accept: application/json',
                        'Authorization: Basic ' . $encodedAuth,
                        'User-Agent: CM-Webhook-Manager/1.0',
                        'Content-Type: application/json'
                    ]);
                }
            } else if ($method === 'DELETE') {
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
            }
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            
            if ($error) {
                curl_close($ch);
                throw new Exception('cURL Error: ' . $error);
            }
            
            curl_close($ch);
            
            // Set response headers
            header('Content-Type: application/json');
            http_response_code($httpCode);
            
            // Log successful requests (for debugging)
            if (getenv('DEBUG_API') === 'true') {
                $this->logDebug("$method $path - " . $httpCode);
            }
            
            echo $response;
            
        } catch (Exception $e) {
            $this->logError('Unexpected error: ' . $e->getMessage());
            $this->sendError(500, 'Internal server error');
        }
    }
    
    private function isPathAllowed($path) {
        foreach ($this->allowedPaths as $allowedPath) {
            $pattern = str_replace('*', '[^/]+', $allowedPath);
            if (preg_match('#^' . $pattern . '$#', $path)) {
                return true;
            }
        }
        return false;
    }
    
    private function validateWebhookData($data) {
        $errors = [];
        
        if (!isset($data['Url']) || empty($data['Url'])) {
            $errors[] = 'URL is required';
        } elseif (!filter_var($data['Url'], FILTER_VALIDATE_URL)) {
            $errors[] = 'Invalid URL format';
        } elseif (parse_url($data['Url'], PHP_URL_SCHEME) !== 'https') {
            $errors[] = 'URL must use HTTPS';
        }
        
        if (!isset($data['Events']) || !is_array($data['Events']) || empty($data['Events'])) {
            $errors[] = 'At least one event type is required';
        } else {
            $validEvents = ['Subscribe', 'Unsubscribe', 'Deactivate'];
            foreach ($data['Events'] as $event) {
                if (!in_array($event, $validEvents)) {
                    $errors[] = "Invalid event type: $event";
                }
            }
        }
        
        if (!isset($data['PayloadFormat']) || !in_array(strtolower($data['PayloadFormat']), ['json', 'xml'])) {
            $errors[] = 'PayloadFormat must be json or xml';
        }
        
        return $errors;
    }
    
    private function sendError($code, $message) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
    }
    
    private function logError($message) {
        $logFile = __DIR__ . '/../storage/logs/error.log';
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] ERROR: $message\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    private function logDebug($message) {
        $logFile = __DIR__ . '/../storage/logs/debug.log';
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] DEBUG: $message\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
}

// Initialize and handle request
$proxy = new ApiProxy();
$proxy->handleRequest();