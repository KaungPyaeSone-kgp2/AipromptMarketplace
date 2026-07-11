<?php

class SupabaseStorage {
    private $url;
    private $key;
    private $bucket;

    public function __construct($bucket = 'uploads') {
        $config = @parse_ini_file(__DIR__ . '/../config.ini', true);
        if (!is_array($config)) {
            $config = [];
        }
        $supabaseConfig = $config['Supabase'] ?? [];
        
        $this->url = getenv('SUPABASE_URL') ?: ($supabaseConfig['SUPABASE_URL'] ?? '');
        $this->key = getenv('SUPABASE_KEY') ?: ($supabaseConfig['SUPABASE_KEY'] ?? '');
        $this->bucket = $bucket;
        
        if (empty($this->url) || empty($this->key)) {
            error_log("Supabase URL or Key is not set in config.ini");
        }
    }

    /**
     * Uploads a file to Supabase Storage
     *
     * @param string $fileTmpPath The local temporary file path
     * @param string $destPath The destination path inside the bucket (e.g., 'profiles/abc.png')
     * @param string $contentType The mime type of the file
     * @return string|false The public URL if successful, false otherwise
     */
    public function upload($fileTmpPath, $destPath, $contentType = 'application/octet-stream') {
        if (empty($this->url) || empty($this->key)) {
            return false;
        }

        $fileContent = @file_get_contents($fileTmpPath);

        // Automatically convert images to WebP if extensions are available
        $converted = false;
        if (strpos($contentType, 'image/') === 0 && $contentType !== 'image/webp' && $contentType !== 'image/svg+xml' && $contentType !== 'image/gif') {
            
            // Try Imagick first
            if (class_exists('Imagick')) {
                try {
                    $imagick = new Imagick();
                    $imagick->readImageBlob($fileContent);
                    $imagick->setImageFormat('webp');
                    $imagick->setImageCompressionQuality(85);
                    $fileContent = $imagick->getImageBlob();
                    $contentType = 'image/webp';
                    $destPath = preg_replace('/\.[^.]+$/', '.webp', $destPath);
                    $converted = true;
                    $imagick->clear();
                    $imagick->destroy();
                } catch (Exception $e) {
                    // Imagick failed, fallback to GD
                }
            }

            // Fallback to GD if Imagick is not available or failed
            if (!$converted && function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
                $image = @imagecreatefromstring($fileContent);
                if ($image !== false) {
                    // Preserve transparency for PNGs
                    imagepalettetotruecolor($image);
                    imagealphablending($image, false);
                    imagesavealpha($image, true);
                    
                    // Use output buffering to capture image data directly into memory without disk writing
                    ob_start();
                    if (@imagewebp($image, null, 85)) {
                        $webpContent = ob_get_clean();
                        if (!empty($webpContent)) {
                            $fileContent = $webpContent;
                            $contentType = 'image/webp';
                            $destPath = preg_replace('/\.[^.]+$/', '.webp', $destPath);
                        }
                    } else {
                        ob_end_clean();
                    }
                    imagedestroy($image);
                }
            }
        }

        // Ensure URL has https://
        $baseUrl = trim($this->url);
        $baseUrl = rtrim($baseUrl, '/');
        if (!preg_match('~^(?:f|ht)tps?://~i', $baseUrl)) {
            $baseUrl = "https://" . $baseUrl;
        }
        
        // URL encode the destination path parts to handle spaces and special characters
        $pathParts = explode('/', ltrim($destPath, '/'));
        $encodedParts = array_map('rawurlencode', $pathParts);
        $encodedPath = implode('/', $encodedParts);
        
        $endpoint = $baseUrl . '/storage/v1/object/' . $this->bucket . '/' . $encodedPath;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
        
        // Prevent SSL issues in Docker containers
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: ' . $contentType
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        
        curl_close($ch);

        if ($response !== false && $httpCode >= 200 && $httpCode < 300) {
            return $this->getPublicUrl($destPath);
        }

        $errorMsg = $response === false ? "cURL Error: " . $curlError : $response;
        error_log("Supabase Upload Error ($httpCode): " . $errorMsg);
        throw new Exception("Supabase Error ($httpCode): " . $errorMsg);
    }

    /**
     * Gets the public URL of a file in Supabase Storage
     *
     * @param string $path The path inside the bucket
     * @return string The full public URL
     */
    public function getPublicUrl($path) {
        $baseUrl = trim($this->url);
        $baseUrl = rtrim($baseUrl, '/');
        if (!preg_match('~^(?:f|ht)tps?://~i', $baseUrl)) {
            $baseUrl = "https://" . $baseUrl;
        }
        
        $pathParts = explode('/', ltrim($path, '/'));
        $encodedParts = array_map('rawurlencode', $pathParts);
        $encodedPath = implode('/', $encodedParts);
        
        return $baseUrl . '/storage/v1/object/public/' . $this->bucket . '/' . $encodedPath;
    }
}
