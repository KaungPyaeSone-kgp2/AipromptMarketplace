<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../database/Database.php";
require_once __DIR__ . "/../dao/BaseDAO.php";

// $userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);
// if (!$userId || $userId <= 0) {
//     http_response_code(400);
//     echo json_encode([
//         "success" => false,
//         "message" => "A valid user_id is required",
//     ]);
//     exit;
// }

try {
    $db = new Database();
    $pdo = $db->connect();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed",
    ]);
    exit;
}

$dao = new BaseDAO($pdo);
 $userId = 1; // For testing purposes, replace with actual user_id from request
try {
    $users = $dao->select(
        "SELECT id, user_name, user_email, user_role, creator_mode, coin_balance, following_count, purchased_prompts_count, profile_image, created_at, updated_at
         FROM users
         WHERE id = :user_id
         AND creator_mode = 0
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($users) === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Buyer user not found",
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "creator_mode" => 0,
        "data" => $users[0],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
