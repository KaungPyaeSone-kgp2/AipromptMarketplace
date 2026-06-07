<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

$userId = filter_var($payload["user_id"] ?? null, FILTER_VALIDATE_INT);
$withdrawPassword = trim($payload["withdraw_password"] ?? "");

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

// Validate withdraw password
if (strlen($withdrawPassword) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Withdraw password must be at least 8 characters"]);
    exit;
}

if (!preg_match('/[A-Z]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 uppercase letter"]);
    exit;
}

if (!preg_match('/[0-9]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 number"]);
    exit;
}

if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 special character"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    // Auto-create request_creator_mode table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS request_creator_mode (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            request_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            rejected_message TEXT NULL,
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ");

    // Auto-migrate: add withdraw_password column to users table if it doesn't exist
    $columns = $pdo->query("SHOW COLUMNS FROM users LIKE 'withdraw_password'")->fetchAll();
    if (count($columns) === 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN withdraw_password VARCHAR(255) NULL AFTER creator_mode");
    }

    // Check if user exists
    $users = $dao->select(
        "SELECT id, creator_mode FROM users WHERE id = :user_id LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($users) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Check if already a creator
    if ($users[0]["creator_mode"]) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You are already a creator"]);
        exit;
    }

    // Check if there's already a pending request
    $existing = $dao->select(
        "SELECT id, request_status FROM request_creator_mode
         WHERE user_id = :user_id AND request_status = 'pending'
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($existing) > 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You already have a pending request"]);
        exit;
    }

    // Hash the withdraw password and store in users table
    $hashedPassword = password_hash($withdrawPassword, PASSWORD_DEFAULT);

    $dao->update(
        "UPDATE users SET withdraw_password = :withdraw_password WHERE id = :user_id",
        [
            ":withdraw_password" => $hashedPassword,
            ":user_id" => $userId,
        ]
    );

    // Insert the request
    $requestId = $dao->insert(
        "INSERT INTO request_creator_mode (user_id)
         VALUES (:user_id)",
        [":user_id" => $userId]
    );

    echo json_encode([
        "success" => true,
        "message" => "Your creator request has been submitted and is pending approval.",
        "data" => [
            "request_id" => $requestId,
            "request_status" => "pending",
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
