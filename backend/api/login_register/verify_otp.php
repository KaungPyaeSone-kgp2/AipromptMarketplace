<?php
// backend/api/verify_otp.php

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
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

if (!isset($_SESSION['otp_action']) || !isset($_SESSION['temp_otp'])) {
    echo json_encode(["success" => false, "message" => "Session expired or invalid state. Please restart the process."]);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
$entered_otp = isset($inputData['otp']) ? trim($inputData['otp']) : '';

if (empty($entered_otp)) {
    echo json_encode(["success" => false, "message" => "Please enter the OTP."]);
    exit;
}

if (time() > $_SESSION['otp_expires_at']) {
    unset($_SESSION['temp_user'], $_SESSION['temp_login_user'], $_SESSION['temp_forgot_user'], $_SESSION['temp_otp'], $_SESSION['otp_action']);
    echo json_encode(["success" => false, "message" => "OTP has expired. Please restart the process."]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    if ($entered_otp === $_SESSION['temp_otp']) {
        
        $action = $_SESSION['otp_action'];
        $response_payload = ["success" => true];

        if ($action === 'register') {
            $user = $_SESSION['temp_user'];
            
            // 1. Insert into users table (no oauth_id for email registrations — DB defaults to NULL)
            $sql = "INSERT INTO users (user_name, user_email, user_password, profile_image) VALUES (:username, :email, :password, :profile_image)";
            $new_user_id = $dao->insert($sql, [
                'username' => $user['username'], 
                'email' => $user['email'], 
                'password' => $user['password'], 
                'profile_image' => $user['profile_image']
            ]);

            // 2. Immediately initialize creator_data table mapping
            $creatorSql = "INSERT INTO creator_data (user_id) VALUES (:user_id)";
            $dao->insert($creatorSql, ['user_id' => $new_user_id]);

            $response_payload['message'] = "Registration successful!";
            $response_payload['redirect'] = "/login";

            require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
            ensureTodayStatsRow($db);

            $sql = "UPDATE dashboard_daily_stats SET total_users = total_users + 1, new_users_count = new_users_count + 1 WHERE stat_date = CURDATE()";
            $dao->update($sql,[]);
        } 
        elseif ($action === 'login') {
            $user = $_SESSION['temp_login_user'];
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['user_name'];
            $_SESSION['user_email'] = $user['user_email'];
            $_SESSION['user_role'] = $user['user_role'];
            $_SESSION['profile_image'] = $user['profile_image'];

            $response_payload['message'] = "Login successful!";
            $response_payload['redirect'] = ($user['user_role'] === 'admin') ? "/admin" : "/user";

            if($user['user_role'] === 'user') {
                $sql = "INSERT INTO user_login_logs(user_id) VALUES (:id)";
                $param = [
                    ":id" => $user['id']
                ];
                $dao->insert($sql,$param);
            }
        }
        elseif ($action === 'forgot_password') {
            $_SESSION['allow_password_reset'] = true;
            $_SESSION['reset_user_id'] = $_SESSION['temp_forgot_user']['id'];
            $response_payload['message'] = "OTP Verified! Redirecting to password reset...";
            $response_payload['redirect'] = "/reset-password";
        }

        // Clear temporary data on success
        unset($_SESSION['temp_user'], $_SESSION['temp_login_user'], $_SESSION['temp_forgot_user'], $_SESSION['temp_otp'], $_SESSION['otp_expires_at'], $_SESSION['otp_attempts'], $_SESSION['otp_action']);

        echo json_encode($response_payload);

    } else {
        $_SESSION['otp_attempts']++;
        $attempts_left = 3 - $_SESSION['otp_attempts'];
        
        if ($_SESSION['otp_attempts'] >= 3) {
            if ($_SESSION['otp_action'] === 'login') {
                $user_id = $_SESSION['temp_login_user']['id'];
                $sql = "UPDATE users SET is_banned = TRUE WHERE id = :id";
                $dao->update($sql, ['id' => $user_id]);
                $error_msg = "Account banned due to multiple failed attempts. Please contact support.";
            } else {
                $error_msg = "Verification failed multiple times. Session destroyed.";
            }

            unset($_SESSION['temp_user'], $_SESSION['temp_login_user'], $_SESSION['temp_forgot_user'], $_SESSION['temp_otp'], $_SESSION['otp_action']);
            echo json_encode(["success" => false, "message" => $error_msg, "redirect" => "/"]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid OTP. You have {$attempts_left} attempt(s) left."]);
        }
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
