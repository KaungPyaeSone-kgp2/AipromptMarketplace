<?php
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../../includes/cors_headers.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$userId = intval($input["user_id"] ?? 0);
$notificationId = intval($input["notification_id"] ?? 0);
$deleteAll = !empty($input["delete_all"]);

if (!$userId) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $recipientColumn = db_has_column($pdo, 'notifications', 'user_id') ? 'user_id' : 'receiver_id';

    if ($deleteAll) {
        // Delete ALL notifications for this user
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE `{$recipientColumn}` = ?");
        $stmt->execute([$userId]);
    } elseif ($notificationId > 0) {
        // Delete a single notification (owned by this user)
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND `{$recipientColumn}` = ?");
        $stmt->execute([$notificationId, $userId]);
    } else {
        echo json_encode(["success" => false, "message" => "Provide notification_id or delete_all"]);
        exit();
    }

    echo json_encode(["success" => true, "deleted_count" => $stmt->rowCount()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
