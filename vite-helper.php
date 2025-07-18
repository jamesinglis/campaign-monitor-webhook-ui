<?php
/**
 * Simple Vite integration helper (inspired by Laravel)
 */
function vite($entrypoints = []) {
    // Always use built assets - no development mode
    $manifestPath = __DIR__ . '/dist/.vite/manifest.json';
    
    if (!file_exists($manifestPath)) {
        return '<!-- Vite manifest not found. Run "npm run build" -->';
    }
    
    $manifest = json_decode(file_get_contents($manifestPath), true);
    $html = '';
    
    foreach ((array) $entrypoints as $entrypoint) {
        if (!isset($manifest[$entrypoint])) {
            continue;
        }
        
        $asset = $manifest[$entrypoint];
        
        // Add CSS files
        if (isset($asset['css'])) {
            foreach ($asset['css'] as $css) {
                $html .= '<link rel="stylesheet" href="/dist/' . $css . '">' . "\n";
            }
        }
        
        // Add preload for imports
        if (isset($asset['imports'])) {
            foreach ($asset['imports'] as $import) {
                if (isset($manifest[$import])) {
                    $importAsset = $manifest[$import];
                    $html .= '<link rel="modulepreload" href="/dist/' . $importAsset['file'] . '">' . "\n";
                }
            }
        }
        
        // Add main JS file
        $html .= '<script type="module" src="/dist/' . $asset['file'] . '"></script>' . "\n";
    }
    
    return $html;
}
?>