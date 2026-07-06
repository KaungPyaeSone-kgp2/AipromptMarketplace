<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

session_start();
$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT) ?? $_SESSION['user_id'] ?? null;

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $bioExpr = db_column_expr($pdo, 'users', 'user_bio', 'user_bio', "''");

    $users = $dao->select(
        "SELECT
            u.id,
            u.user_name,
            u.user_email,
            u.user_role,
            (cd.id IS NOT NULL) AS is_creator,
            (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) AS following_count,
            (SELECT COUNT(*) FROM followers WHERE creator_id = u.id) AS followers_count,
            (SELECT COUNT(*) FROM prompts WHERE creator_id = u.id AND permission != 'Draft' AND (is_banned IS NULL OR is_banned = 0)) AS posted_prompt_count,
            u.profile_image,
            {$bioExpr} AS user_bio,
            u.created_at,
            u.updated_at
         FROM users u
         LEFT JOIN creator_data cd ON cd.user_id = u.id
         WHERE u.id = :user_id
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($users) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $user = $users[0];
    $user["is_creator"] = (bool) $user["is_creator"];

    echo json_encode([
        "success" => true,
        "is_creator" => $user["is_creator"],
        "data" => $user,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
