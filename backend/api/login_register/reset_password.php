<?php
// backend/api/reset_password.php

require_once __DIR__ . '/../../includes/cors_headers.php'; 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../../config/Database.php'; 
require_once '../../dao/BaseDAO.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

// SECURITY CHECK: Did they pass verify_otp.php?
if (!isset($_SESSION['allow_password_reset']) || !isset($_SESSION['reset_user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized access. Please verify your OTP first.", "redirect" => "/login"]);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
$password = isset($inputData['password']) ? $inputData['password'] : '';

if (empty($password)) {
    echo json_encode(["success" => false, "message" => "Password cannot be empty."]);
    exit;
}

// Strong Password Validation
$uppercase = preg_match('@[A-Z]@', $password);
$lowercase = preg_match('@[a-z]@', $password);
$number    = preg_match('@[0-9]@', $password);
$specialChars = preg_match('@[^\w]@', $password);

if (!$uppercase || !$lowercase || !$number || !$specialChars || strlen($password) < 8) {
    echo json_encode([
        "success" => false, 
        "message" => "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $sql = "UPDATE users SET user_password = :password WHERE id = :id";
    $dao->update($sql, [
        'password' => $hashed_password,
        'id' => $_SESSION['reset_user_id']
    ]);

    // Destroy reset sessions after success
    unset($_SESSION['allow_password_reset'], $_SESSION['reset_user_id']);

    echo json_encode([
        "success" => true, 
        "message" => "Password successfully reset! Redirecting to login..."
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "System error: " . $e->getMessage()]);
}
?>
