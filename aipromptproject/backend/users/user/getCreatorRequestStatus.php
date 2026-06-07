<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only GET method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$userId = filter_var($_GET["user_id"] ?? null, FILTER_VALIDATE_INT);

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    // Check if the table exists first
    $tables = $pdo->query("SHOW TABLES LIKE 'request_creator_mode'")->fetchAll();
    if (count($tables) === 0) {
        // Table doesn't exist yet, no request
        echo json_encode([
            "success" => true,
            "data" => null,
        ]);
        exit;
    }

    // Get the latest request for this user
    $requests = $dao->select(
        "SELECT id, request_status, rejected_message, requested_at, approved_at
         FROM request_creator_mode
         WHERE user_id = :user_id
         ORDER BY requested_at DESC
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($requests) === 0) {
        echo json_encode([
            "success" => true,
            "data" => null,
        ]);
        exit;
    }

    $request = $requests[0];

    echo json_encode([
        "success" => true,
        "data" => [
            "id" => (int)$request["id"],
            "request_status" => $request["request_status"],
            "rejected_message" => $request["rejected_message"],
            "requested_at" => $request["requested_at"],
            "approved_at" => $request["approved_at"],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
