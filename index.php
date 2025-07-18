<?php
// Main entry point for the application
// This serves the Vue.js application and handles API routing

require_once __DIR__ . '/vite-helper.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Handle API requests
if (strpos($requestPath, '/api/') === 0) {
    // Extract the API path after /api/
    $apiPath = substr($requestPath, 5);
    
    // Set the path for the proxy
    $_GET['path'] = $apiPath;
    
    // Include the API proxy
    require_once __DIR__ . '/api/proxy.php';
    exit;
}

// Handle static assets from dist folder
if (file_exists(__DIR__ . '/dist') && (strpos($requestPath, '/assets/') === 0 || strpos($requestPath, '/dist/') === 0)) {
    $filePath = strpos($requestPath, '/dist/') === 0 ? __DIR__ . $requestPath : __DIR__ . '/dist' . $requestPath;
    
    if (file_exists($filePath) && is_file($filePath)) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        // Set proper MIME types
        switch ($extension) {
            case 'js':
                header('Content-Type: application/javascript');
                break;
            case 'css':
                header('Content-Type: text/css');
                break;
            case 'json':
                header('Content-Type: application/json');
                break;
            case 'svg':
                header('Content-Type: image/svg+xml');
                break;
            case 'png':
                header('Content-Type: image/png');
                break;
            case 'jpg':
            case 'jpeg':
                header('Content-Type: image/jpeg');
                break;
            case 'gif':
                header('Content-Type: image/gif');
                break;
            case 'ico':
                header('Content-Type: image/x-icon');
                break;
            case 'woff':
                header('Content-Type: font/woff');
                break;
            case 'woff2':
                header('Content-Type: font/woff2');
                break;
            case 'ttf':
                header('Content-Type: font/ttf');
                break;
            case 'eot':
                header('Content-Type: application/vnd.ms-fontobject');
                break;
            default:
                header('Content-Type: application/octet-stream');
        }
        
        // Set cache headers for static assets
        header('Cache-Control: public, max-age=31536000');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        
        readfile($filePath);
        exit;
    }
}

// Serve the application
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Campaign Monitor Webhook Management</title>
    <?php echo vite(['src/main.js']); ?>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
<?php
?>