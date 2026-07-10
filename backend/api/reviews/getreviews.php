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

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$promptId = filter_input(INPUT_GET, "prompt_id", FILTER_VALIDATE_INT);
$creatorId = filter_input(INPUT_GET, "creator_id", FILTER_VALIDATE_INT);
$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);

$where = ["(r.is_banned IS NULL OR r.is_banned = 0)"];
$params = [];

if ($promptId) {
    $where[] = "r.prompt_id = :prompt_id";
    $params[":prompt_id"] = $promptId;
}
if ($creatorId) {
    $where[] = "p.creator_id = :creator_id";
    $params[":creator_id"] = $creatorId;
}
if ($userId) {
    $where[] = "r.user_id = :user_id";
    $params[":user_id"] = $userId;
}

$whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

try {

    $reviews = $dao->select(
        "SELECT
            r.id AS review_id,
            r.user_id,
            u.user_name AS reviewer_name,
            (cdr.id IS NOT NULL) AS reviewer_is_creator,
            u.profile_image AS reviewer_profile_image,
            r.prompt_id,
            p.title AS prompt_title,
            p.prompt_description,
            p.creator_id,
            creator.user_name AS creator_name,
            r.rating,
            r.review_text,
            r.created_at
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         JOIN prompts p ON r.prompt_id = p.id
         JOIN users creator ON p.creator_id = creator.id
         LEFT JOIN creator_data cdr ON cdr.user_id = u.id
         $whereSql
         ORDER BY r.created_at DESC",
        $params
    );

    foreach ($reviews as &$review) {
        $review["reviewer_is_creator"] = (bool)$review["reviewer_is_creator"];
    }
    unset($review);

    $summary = $dao->select(
        "SELECT COUNT(*) AS review_count, COALESCE(AVG(r.rating), 0) AS average_rating
         FROM reviews r
         JOIN prompts p ON r.prompt_id = p.id
         JOIN users creator ON p.creator_id = creator.id
         $whereSql",
        $params
    );

    echo json_encode([
        "success" => true,
        "count" => (int)($summary[0]["review_count"] ?? 0),
        "average_rating" => (float)($summary[0]["average_rating"] ?? 0),
        "data" => $reviews,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
