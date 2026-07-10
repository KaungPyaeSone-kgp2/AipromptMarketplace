<?php
// backend/api/forgot_password.php

header("Access-Control-Allow-Origin: http://localhost:5173"); 
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
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
$email = isset($inputData['email']) ? trim($inputData['email']) : '';

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Please enter your email address."]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    $sql = "SELECT id, user_name, user_email FROM users WHERE user_email = :email AND is_banned = FALSE";
    $users = $dao->select($sql, ['email' => $email]);
    $user = count($users) > 0 ? $users[0] : null;

    // We generate an OTP whether the user exists or not to prevent email enumeration attacks,
    // but we only actually send the email if the user exists.
    $otp_code = sprintf("%06d", random_int(0, 999999));
    
    $_SESSION['temp_forgot_user'] = $user ? $user : ['user_email' => $email]; 
    $_SESSION['temp_otp'] = $otp_code;
    $_SESSION['otp_expires_at'] = time() + (3 * 60); 
    $_SESSION['otp_attempts'] = 0; 
    $_SESSION['otp_action'] = 'forgot_password';

    if ($user) {
        require_once '../../includes/mail.php';
        send_otp_email($email, $otp_code);
    } 

    // Always return success so attackers can't guess valid emails
    echo json_encode([
        "success" => true, 
        "message" => "If an account exists with that email, an OTP has been sent."
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "System error. Please try again later."]);
}
?>
