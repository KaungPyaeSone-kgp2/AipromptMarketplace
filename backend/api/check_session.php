<?php
// backend/api/check_session.php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Changed to POST
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// If the session doesn't exist, tell React they are unauthenticated
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "authenticated" => false,
        "message" => "No active session found."
    ]);
    exit;
}

// If session exists, return user info so React can update its state
echo json_encode([
    "authenticated" => true,
    "user" => [
        "id" => $_SESSION['user_id'],
        "username" => $_SESSION['user_name'],
        "role" => $_SESSION['user_role'],
        "profile_image" => $_SESSION['profile_image'] ?? ""
    ]
]);
?>
