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

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

$userId = filter_var($payload["user_id"] ?? null, FILTER_VALIDATE_INT);
$withdrawPassword = $payload["withdraw_password"] ?? "";

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

if (empty($withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Withdraw password is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare("SELECT withdraw_password FROM users WHERE id = :user_id LIMIT 1");
    $stmt->execute([":user_id" => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    if (empty($user["withdraw_password"])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No withdraw password set"]);
        exit;
    }

    if (!password_verify($withdrawPassword, $user["withdraw_password"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect withdraw password"]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "Password verified"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
