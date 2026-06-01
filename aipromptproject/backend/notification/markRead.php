<?php
require_once __DIR__ . "/../database/Database.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$userId = intval($input["user_id"] ?? 0);
$notificationId = intval($input["notification_id"] ?? 0);
$markAll = boolval($input["mark_all"] ?? false);

if (!$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->connect();

    if ($markAll) {
        // Mark all unread notifications as read for this user
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        $affected = $stmt->rowCount();
    } elseif ($notificationId) {
        // Mark a single notification as read
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);
        $affected = $stmt->rowCount();
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "notification_id or mark_all is required"]);
        exit();
    }

    echo json_encode(["success" => true, "affected" => $affected]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
