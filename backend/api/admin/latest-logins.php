<?php

// 1. Send CORS headers immediately so they register even if a database error happens
require_once __DIR__ . '/../../includes/cors_headers.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

date_default_timezone_set("Asia/Yangon");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

try {
    require_once __DIR__ . "/../../config/Database.php";
    require_once __DIR__ . "/../../dao/BaseDAO.php";

    $input = json_decode(file_get_contents("php://input"), true);
    $limit = isset($input["limit"]) ? (int)$input["limit"] : 5;

    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // Explicitly casting to int prevents injection and circumvents PDO type-binding bugs on LIMIT clauses
    $sql = "SELECT u.user_name, u.user_email, ull.login_at
            FROM user_login_logs ull
            INNER JOIN users u ON ull.user_id = u.id
            ORDER BY ull.login_at DESC
            LIMIT " . (int)$limit;

    $logs = $baseDAO->select($sql, []);

    echo json_encode([
        "success" => true,
        "data" => [
            "logins" => $logs
        ]
    ]);

} catch (Throwable $e) {
    // Catching Throwable handles both PHP 7/8 internal Errors and basic Exceptions safely
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load latest logins",
        "error" => $e->getMessage()
    ]);
}
