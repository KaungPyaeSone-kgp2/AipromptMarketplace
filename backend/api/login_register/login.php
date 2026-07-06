<?php
// backend/api/login.php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
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

$email = isset($inputData['email']) ? trim($inputData['email']) : '';
$password = isset($inputData['password']) ? $inputData['password'] : '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    exit;
}

try {
    // Initialize Database and BaseDAO
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    // Removed creator_mode from the query
    $sql = "SELECT id, user_name, user_email, user_password, user_role, is_banned, profile_image FROM users WHERE user_email = :email";
    $users = $dao->select($sql, ['email' => $email]);
    
    // BaseDAO select() returns an array of records. Grab the first one if it exists.
    $user = count($users) > 0 ? $users[0] : null;

    if ($user && password_verify($password, $user['user_password'])) {
        if ($user['is_banned'] == 1) {
            echo json_encode(["success" => false, "message" => "Your account has been suspended."]);
            exit;
        }
        
        $otp_code = sprintf("%06d", random_int(0, 999999));
        
        $_SESSION['temp_login_user'] = $user;
        $_SESSION['temp_otp'] = $otp_code;
        $_SESSION['otp_expires_at'] = time() + (3 * 60);
        $_SESSION['otp_attempts'] = 0; 
        $_SESSION['otp_action'] = 'login'; 

        require_once '../../includes/mail.php';

        if (send_otp_email($email, $otp_code) === "SUCCESS") {
            echo json_encode([
                "success" => true, 
                "message" => "OTP Verification code sent to your email."
            ]);
        } else {
            unset($_SESSION['temp_login_user'], $_SESSION['temp_otp'], $_SESSION['otp_action']);
            echo json_encode(["success" => false, "message" => "Failed to dispatch verification email."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect email or password."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "System error: " . $e->getMessage()]);
}
?>
