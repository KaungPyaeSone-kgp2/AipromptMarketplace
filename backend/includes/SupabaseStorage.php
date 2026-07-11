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

        $fileContent = file_get_contents($fileTmpPath);

        // Automatically convert images to WebP if GD library is available
        if (function_exists('imagecreatefromstring') && function_exists('imagewebp') && strpos($contentType, 'image/') === 0 && $contentType !== 'image/webp' && $contentType !== 'image/svg+xml' && $contentType !== 'image/gif') {
            $image = @imagecreatefromstring($fileContent);
            if ($image !== false) {
                // Preserve transparency for PNGs
                imagepalettetotruecolor($image);
                imagealphablending($image, false);
                imagesavealpha($image, true);
                
                $tempWebpPath = sys_get_temp_dir() . '/' . uniqid('webp_', true) . '.webp';
                
                // Write to temp file to avoid output buffering issues that can corrupt the image
                if (@imagewebp($image, $tempWebpPath, 85)) {
                    $fileContent = file_get_contents($tempWebpPath);
                    $contentType = 'image/webp';
                    $destPath = preg_replace('/\.[^.]+$/', '.webp', $destPath);
                    @unlink($tempWebpPath);
                }
                imagedestroy($image);
            }
        }

        $endpoint = rtrim($this->url, '/') . '/storage/v1/object/' . $this->bucket . '/' . ltrim($destPath, '/');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
        
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: ' . $contentType
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return $this->getPublicUrl($destPath);
        }

        error_log("Supabase Upload Error ($httpCode): " . $response);
        throw new Exception("Supabase Error ($httpCode): " . $response);
    }

    /**
     * Gets the public URL of a file in Supabase Storage
     *
     * @param string $path The path inside the bucket
     * @return string The full public URL
     */
    public function getPublicUrl($path) {
        return rtrim($this->url, '/') . '/storage/v1/object/public/' . $this->bucket . '/' . ltrim($path, '/');
    }
}
