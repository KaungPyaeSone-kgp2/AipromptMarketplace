<?php
// backend/api/login_register/get_current_user.php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Check if a valid user session exists
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "user_name" => $_SESSION['user_name'] ?? 'User',
            "user_email" => $_SESSION['user_email'] ?? 'example@gmail.com',
            "user_role" => $_SESSION['user_role'] ?? 'user',
            "profile_image" => $_SESSION['profile_image'] ?? 'http://localhost:8000/uploads/profiles/default-profile-picture-male-icon.svg'
        ]
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "User is not logged in or session expired."
    ]);
}
?>
