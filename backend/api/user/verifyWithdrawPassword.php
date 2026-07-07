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

http_response_code(501);
echo json_encode([
    "success" => false,
    "message" => "Withdraw password verification is unavailable because the current users table has no withdraw_password column.",
]);
?>
