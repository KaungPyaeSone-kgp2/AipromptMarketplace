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

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "A valid user_id is required",
    ]);
    exit;
}

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

try {
    $creators = $dao->select(
        "SELECT
            u.id,
            u.user_name,
            u.user_email,
            u.user_role,
            u.creator_mode,
            u.coin_balance,
            u.following_count,
            u.purchased_prompts_count,
            u.profile_image,
            u.created_at AS user_created_at,
            u.updated_at AS user_updated_at,
            cd.id AS creator_data_id,
            cd.total_earning_coins,
            cd.total_sales_count,
            cd.followers_count,
            cd.posted_prompt_count,
            cd.created_at AS creator_created_at,
            cd.updated_at AS creator_updated_at
         FROM users u
         INNER JOIN creator_data cd ON cd.user_id = u.id
         WHERE u.id = :user_id
         AND u.creator_mode = 1
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($creators) === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Creator user not found",
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "creator_mode" => 1,
        "data" => $creators[0],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
