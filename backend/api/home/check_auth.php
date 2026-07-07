<?php
// backend/api/check_auth.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors_headers.php';
require_once __DIR__ . '/../../includes/url_helper.php'; // Adjust to your React port
header('Access-Control-Allow-Credentials: true');

session_start();

// Check if the user is logged in via your existing session variable
if (isset($_SESSION['user_id']) || isset($_SESSION['is_logged_in'])) {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => true,
        'dashboardUrl' => '../auth/dashboard.php', // Adjust to your actual dashboard path
        'avatarUrl' => getBackendBaseUrl() . '/uploads/profiles/default-profile-picture-male-icon.svg'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => false
    ]);
}
?>
