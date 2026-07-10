<?php
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$userId = intval($input["user_id"] ?? 0);
$notificationId = intval($input["notification_id"] ?? 0);

if (!$userId) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $recipientColumn = db_has_column($pdo, 'notifications', 'user_id') ? 'user_id' : 'receiver_id';

    if ($notificationId > 0) {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND `{$recipientColumn}` = ?");
        $stmt->execute([$notificationId, $userId]);
    } else {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE `{$recipientColumn}` = ? AND is_read = 0");
        $stmt->execute([$userId]);
    }

    echo json_encode(["success" => true, "updated_count" => $stmt->rowCount()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
