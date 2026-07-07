<?php
$dir = new RecursiveDirectoryIterator(__DIR__ . '/api');
$ite = new RecursiveIteratorIterator($dir);
foreach ($ite as $file) {
    if ($file->getExtension() === 'php') {
        $content = file_get_contents($file->getPathname());
        
        $hasUrl = strpos($content, 'localhost:8000') !== false;
        if ($hasUrl) {
            $relativePath = str_replace('\\', '/', substr($file->getPathname(), strlen(__DIR__ . '/api/')));
            $depth = substr_count($relativePath, '/');
            
            $includePath = '';
            if ($depth == 0) {
                $includePath = "require_once __DIR__ . '/../includes/url_helper.php';";
            } else if ($depth == 1) {
                $includePath = "require_once __DIR__ . '/../../includes/url_helper.php';";
            } else if ($depth == 2) {
                $includePath = "require_once __DIR__ . '/../../../includes/url_helper.php';";
            }
            
            // Insert require_once after cors_headers.php
            $pattern = '/(require_once __DIR__ . \'.*?cors_headers\.php\';)/i';
            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, "$1\n" . $includePath, $content);
            } else {
                $content = preg_replace('/<\?php/', "<?php\n" . $includePath, $content, 1);
            }
            
            // Replacements
            $content = str_replace("'http://localhost:8000/uploads/profiles/default-profile-picture-male-icon.svg'", "getBackendBaseUrl() . '/uploads/profiles/default-profile-picture-male-icon.svg'", $content);
            $content = str_replace('"http://localhost:8000/"', 'getBackendBaseUrl() . "/"', $content);
            $content = str_replace("'http://localhost:8000/'", "getBackendBaseUrl() . '/'", $content);
            
            file_put_contents($file->getPathname(), $content);
            echo "Updated URLs in " . $file->getPathname() . "\n";
        }
    }
}
?>
