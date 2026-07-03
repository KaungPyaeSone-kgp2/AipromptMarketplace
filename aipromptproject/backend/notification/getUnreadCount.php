<?php
require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);
if (!$userId) {
    echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $recipientColumn = db_has_column($pdo, 'notifications', 'user_id') ? 'user_id' : 'receiver_id';

    $stmt = $pdo->prepare("SELECT COUNT(*) AS unread_count FROM notifications WHERE `{$recipientColumn}` = ? AND is_read = 0");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "unread_count" => (int)($row["unread_count"] ?? 0)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>