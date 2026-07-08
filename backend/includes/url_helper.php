<?php
// backend/includes/url_helper.php

/**
 * Returns the base URL of the backend API dynamically.
 * Works for localhost and deployed environments (e.g. Railway).
 */
function getBackendBaseUrl() {
    // Dynamically determine the current domain (monolith setup)
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;
    
    // Check for reverse proxy (e.g. Railway) terminating SSL
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $is_https = true;
    }
    
    $protocol = $is_https ? "https://" : "http://";
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
    return $protocol . $host;
}

/**
 * Ensures an image path is a full absolute URL using the backend base URL.
 * 
 * @param string|null $path
 * @param string|null $fallback
 * @return string|null
 */
function getFullImageUrl($path, $fallback = null) {
    if (empty($path)) {
        return $fallback;
    }
    if (strpos($path, 'http') === 0) {
        return $path;
    }
    return getBackendBaseUrl() . "/" . ltrim($path, '/');
}
?>
