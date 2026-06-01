<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

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
    $wishlists = $dao->select(
        "SELECT
            w.id AS wishlist_id,
            w.user_id,
            w.prompt_id,
            w.created_at AS wishlist_created_at,
            p.id,
            p.creator_id,
            p.category_id,
            p.title,
            p.slug,
            p.prompt_description,
            p.full_prompt_content,
            p.thumbnail,
            p.sale_coin,
            p.model_type,
            p.sales_count,
            p.wish_list_count,
            p.review_count,
            p.average_rating,
            p.created_at,
            creator.user_name AS creator_name,
            creator.profile_image,
            c.category_name
         FROM wishlists w
         INNER JOIN prompts p ON p.id = w.prompt_id
         INNER JOIN users creator ON creator.id = p.creator_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE w.user_id = :user_id
         ORDER BY w.created_at DESC",
        [":user_id" => $userId]
    );

    echo json_encode([
        "success" => true,
        "data" => $wishlists,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
    exit;
}

?>
