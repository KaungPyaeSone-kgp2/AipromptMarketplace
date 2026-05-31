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

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $following = $dao->select(
        "SELECT
            u.id,
            u.user_name,
            u.creator_mode,
            u.profile_image,
            u.created_at,
            COALESCE(cd.followers_count, 0) AS followers_count,
            COALESCE(cd.posted_prompt_count, 0) AS posted_prompt_count,
            f.created_at AS followed_at
         FROM followers f
         JOIN users u ON u.id = f.creator_id
         LEFT JOIN creator_data cd ON cd.user_id = u.id
         WHERE f.follower_id = :user_id
         ORDER BY f.created_at DESC",
        [":user_id" => $userId]
    );

    foreach ($following as &$account) {
        $account["creator_mode"] = (bool) $account["creator_mode"];
    }
    unset($account);

    echo json_encode([
        "success" => true,
        "count" => count($following),
        "data" => $following,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
