<?php
require_once __DIR__ . "/../../database/Database.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
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

    $stmt = $pdo->prepare("SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "count" => intval($row["unread_count"])
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
