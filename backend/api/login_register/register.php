<?php
// backend/api/register.php

require_once __DIR__ . '/../../includes/cors_headers.php'; 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Include your custom Database and DAO classes
require_once '../../config/Database.php'; 
require_once '../../dao/BaseDAO.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);

$username = isset($inputData['username']) ? trim($inputData['username']) : '';
$email = isset($inputData['email']) ? trim($inputData['email']) : '';
$password = isset($inputData['password']) ? $inputData['password'] : '';

$profile_image_path = "https://ui-avatars.com/api/?name=" . urlencode($username) . "&background=random&color=fff&rounded=true";

if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    exit;
}

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
    // Initialize Database and BaseDAO
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    // Use DAO select method to check if user exists
    $sql = "SELECT id FROM users WHERE user_email = :email OR user_name = :username";
    $existingUser = $dao->select($sql, ['email' => $email, 'username' => $username]);
    
    if (count($existingUser) > 0) {
        echo json_encode(["success" => false, "message" => "Email or Username already exists."]);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $otp_code = sprintf("%06d", random_int(0, 999999));

    $_SESSION['temp_user'] = [
        'username' => $username,
        'email' => $email,
        'password' => $hashed_password,
        'profile_image' => $profile_image_path
    ];
    $_SESSION['temp_otp'] = $otp_code;
    $_SESSION['otp_expires_at'] = time() + (3 * 60); 
    $_SESSION['otp_attempts'] = 0;
    $_SESSION['otp_action'] = 'register';

    require_once '../../includes/mail.php'; 
    
    $mail_status = send_otp_email($email, $otp_code);
    if ($mail_status === "SUCCESS") {
        echo json_encode([
            "success" => true, 
            "message" => "OTP code has been sent to your email! Proceed to verification."
        ]);
    } else {
        unset($_SESSION['temp_user'], $_SESSION['temp_otp'], $_SESSION['otp_action']);
        echo json_encode(["success" => false, "message" => "Failed to send verification email. Error: " . $mail_status]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "System error: " . $e->getMessage()]);
}
?>
