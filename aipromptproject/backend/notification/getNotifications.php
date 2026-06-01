<?php
require_once __DIR__ . "/../database/Database.php";

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
    
    $stmt = $pdo->prepare("SELECT id, user_id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 20");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $notifications]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
