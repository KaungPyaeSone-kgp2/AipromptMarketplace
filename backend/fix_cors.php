<?php
$dir = new RecursiveDirectoryIterator(__DIR__ . '/api');
$ite = new RecursiveIteratorIterator($dir);
foreach ($ite as $file) {
    if ($file->getExtension() === 'php') {
        $content = file_get_contents($file->getPathname());
        $relativePath = str_replace('\\', '/', substr($file->getPathname(), strlen(__DIR__ . '/api/')));
        $depth = substr_count($relativePath, '/');
        
        $includePath = '';
        if ($depth == 0) {
            $includePath = "require_once __DIR__ . '/../includes/cors_headers.php';";
        } else if ($depth == 1) {
            $includePath = "require_once __DIR__ . '/../../includes/cors_headers.php';";
        } else if ($depth == 2) {
            $includePath = "require_once __DIR__ . '/../../../includes/cors_headers.php';";
        }
        
        $pattern = '/header\(\s*[\'"]Access-Control-Allow-Origin:\s*(?:http:\/\/localhost:5173|\*)[\'"]\s*\);/i';
        $newContent = preg_replace($pattern, $includePath, $content);
        
        if ($newContent !== $content) {
            file_put_contents($file->getPathname(), $newContent);
            echo "Updated " . $file->getPathname() . "\n";
        }
    }
}
?>
