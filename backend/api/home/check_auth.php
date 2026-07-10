<?php
// backend/api/check_auth.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Adjust to your React port
header('Access-Control-Allow-Credentials: true');

session_start();

// Check if the user is logged in via your existing session variable
if (isset($_SESSION['user_id']) || isset($_SESSION['is_logged_in'])) {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => true,
        'dashboardUrl' => '../auth/dashboard.php', // Adjust to your actual dashboard path
        'avatarUrl' => 'http://localhost:8000/uploads/profiles/default-profile-picture-male-icon.svg'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'isLoggedIn' => false
    ]);
}
?>
