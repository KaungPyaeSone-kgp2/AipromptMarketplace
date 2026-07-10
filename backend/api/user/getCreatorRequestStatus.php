<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

session_start();
$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT) ?? $_SESSION['user_id'] ?? null;
if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => ["request_status" => "approved", "rejected_message" => null, "requested_at" => null, "approved_at" => null],
]);
?>
