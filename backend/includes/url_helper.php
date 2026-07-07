<?php
// backend/includes/url_helper.php

/**
 * Returns the base URL of the backend API dynamically.
 * Works for localhost and deployed environments (e.g. Railway).
 */
function getBackendBaseUrl() {
    // Hardcoded to the hosting domain name as requested to avoid localhost issues
    return 'https://dreamkey.up.railway.app';
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
