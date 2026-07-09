<?php
// backend/includes/session_manager.php

// Configure session cookies for cross-origin (CORS) support
// This is critical because the frontend (dreamkey.up.railway.app) 
// and backend (the-backendphp-production.up.railway.app) are on different domains.
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => true,       // Must be true for SameSite=None
    'httponly' => true,     // Protects against XSS
    'samesite' => 'None'    // Allows the cookie to be sent in cross-origin AJAX requests
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
