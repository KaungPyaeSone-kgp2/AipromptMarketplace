<?php
// backend/api/google_callback.php

session_start();

// 1. Include your new Database architecture
require_once '../../config/Database.php'; 
require_once '../../dao/BaseDAO.php';
require_once '../../vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

$config = parse_ini_file(__DIR__ . '/../../config.ini');

$clientID = $config['GOOGLE_CLIENT_ID'];
$clientSecret = $config['GOOGLE_CLIENT_SECRET'];

require_once __DIR__ . '/../../includes/url_helper.php';

// IMPORTANT: This must match the exact API URL registered in your Google Cloud Console
$redirectUri = getBackendBaseUrl() . '/api/login_register/google_callback.php';

// Frontend React Routes
$frontendBaseUrl = getenv('FRONTEND_URL') ?: "https://dreamkey.up.railway.app";
$frontend_login_url = $frontendBaseUrl . "/login";
$frontend_admin_dashboard = $frontendBaseUrl . "/admin";
$frontend_user_dashboard = $frontendBaseUrl . "/user";

try {
    $client = new Client();

    // --- ADD THESE LINES TO BYPASS LOCAL SSL AND PREVENT IPv6 HANGS ---
    $guzzleClient = new \GuzzleHttp\Client([
        'verify' => false,
        'force_ip_resolve' => 'v4', // Crucial to prevent 30+ second hangs on Windows IPv6
        'timeout' => 30 
    ]);
    $client->setHttpClient($guzzleClient);
    // ---------------------------------------------

    $client->setClientId($clientID);
    $client->setClientSecret($clientSecret);
    $client->setRedirectUri($redirectUri);
    $client->addScope("email");
    $client->addScope("profile");

    // --- ADD THESE TWO LINES TO FORCE THE ACCOUNT CHOOSER ---
    $client->setApprovalPrompt('force');
    $client->setPrompt('select_account'); 
    // --------------------------------------------------------

    // If accessed directly without a code, generate URL and send user to Google
    if (!isset($_GET['code'])) {
        $login_url = $client->createAuthUrl();
        header("Location: " . $login_url);
        exit;
    }

    // Exchange the code for a valid token
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    
    if (isset($token['error'])) {
        // Redirect back to React login with an error parameter
        header("Location: " . $frontend_login_url . "?error=google_api_error");
        exit;
    }
    
    $client->setAccessToken($token['access_token']);

    $google_oauth = new Oauth2($client);
    $google_account_info = $google_oauth->userinfo->get();
    
    $oauth_id = $google_account_info->id;
    $email = $google_account_info->email;
    $name = $google_account_info->name;
    $profile_image = $google_account_info->picture;

    // 2. Initialize your BaseDAO
    $database = new Database();
    $db = $database->connect();
    $dao = new BaseDAO($db);

    // 3. Check if user exists using DAO
    $sql = "SELECT * FROM users WHERE user_email = :email";
    $users = $dao->select($sql, ['email' => $email]);
    
    // BaseDAO returns an array, grab the first record if it exists
    $user = count($users) > 0 ? $users[0] : null;

    if ($user) {
        if ($user['is_banned'] == 1) {
            header("Location: " . $frontend_login_url . "?error=banned");
            exit;
        }
        
        if (empty($user['oauth_id'])) {
            $updateSql = "UPDATE users SET oauth_id = :uid WHERE id = :id";
            $dao->update($updateSql, ['uid' => $oauth_id, 'id' => $user['id']]);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['user_name'];
        $_SESSION['user_email'] = $user['user_email'];
        $_SESSION['user_role'] = $user['user_role'];
        $_SESSION['profile_image'] = $profile_image; 

        $user_role = $user['user_role'];

        if($user_role === 'user') {
            $sql = "INSERT INTO user_login_logs(user_id) VALUES (:id)";
            $param = [":id" => $user['id']];

            $dao->insert($sql,$param);
        }

    } else {
        // user_password is NOT NULL, so we pass an empty string for OAuth users
        $insertSql = "INSERT INTO users (oauth_id, user_name, user_email, profile_image, user_password) VALUES (:uid, :name, :email, :image, :pwd)";
        $new_user_id = $dao->insert($insertSql, [
            'uid' => $oauth_id,
            'name' => $name,
            'email' => $email,
            'image' => $profile_image,
            'pwd' => ''
        ]);
        
        // Initialize creator_data for new Google users
        $creatorSql = "INSERT INTO creator_data (user_id) VALUES (:user_id)";
        $dao->insert($creatorSql, ['user_id' => $new_user_id]);

        session_regenerate_id(true);
        $_SESSION['user_id'] = $new_user_id;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = 'user'; 
        $_SESSION['profile_image'] = $profile_image;

        $user_role = 'user';

        $sql = "INSERT INTO user_login_logs(user_id) VALUES (:id)";
            $param = [":id" => $user['id']];

            $dao->insert($sql,$param);
        
        $update_dashbaord = "UPDATE dashboard_daily_stats SET total_users = total_users + 1, new_users_count = new_users_count + 1 WHERE stat_date = CURDATE()";
            require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
            ensureTodayStatsRow($db);
            $dao->update($update_dashbaord,[]);
    }

    // 5. Final Redirect back to React Frontend
    $redirect_url = ($user_role === 'admin') ? $frontend_admin_dashboard : $frontend_user_dashboard;
    header("Location: " . $redirect_url);
    exit;

} catch (\Throwable $e) { 
    // // Safely redirect to React with a generic error code instead of exposing raw PHP errors to the user
    // header("Location: " . $frontend_login_url . "?error=system_fault");
    // exit;

    // Temporarily pass the raw error message to the frontend URL so we can read it!
    $raw_error = urlencode($e->getMessage());
    header("Location: " . $frontend_login_url . "?error=" . $raw_error);
    exit();
}
?>
