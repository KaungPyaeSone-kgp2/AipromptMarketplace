<?php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../../includes/cors_headers.php';
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

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

session_start();
$userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $users = $dao->select("SELECT id FROM users WHERE id = :user_id LIMIT 1", [":user_id" => $userId]);
    if (count($users) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $dao->insert(
        "INSERT INTO creator_data (user_id) VALUES (:user_id) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP",
        [":user_id" => $userId]
    );

    echo json_encode([
        "success" => true,
        "message" => "Creator access is available for all users in the current database.",
        "data" => ["request_status" => "approved"],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
