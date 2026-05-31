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
    echo json_encode([
        "success" => false,
        "message" => "Only GET method is allowed",
    ]);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

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
    $purchasedPrompts = $dao->select(
        "SELECT
            pi.id AS purchase_item_id,
            pur.id AS purchase_id,
            pur.buyer_id,
            pur.total_coin_paid,
            pur.purchased_at,
            pi.prompt_sale_coin,
            pi.purchased_at AS item_purchased_at,
            p.id AS prompt_id,
            p.creator_id,
            creator.user_name,
            creator.profile_image,
            c.category_name,
            p.model_type,
            p.title,
            p.slug,
            p.prompt_description,
            p.full_prompt_content,
            p.thumbnail,
            p.sale_coin,
            p.sales_count,
            COALESCE((
                SELECT COUNT(*)
                FROM wishlists w
                WHERE w.prompt_id = p.id
            ), p.wish_list_count, 0) AS wish_list_count,
            COALESCE((
                SELECT COUNT(*)
                FROM reviews r
                WHERE r.prompt_id = p.id
            ), p.review_count, 0) AS review_count,
            COALESCE((
                SELECT AVG(r.rating)
                FROM reviews r
                WHERE r.prompt_id = p.id
            ), p.average_rating, 0) AS average_rating
         FROM purchases pur
         INNER JOIN purchases_items pi ON pi.purchase_id = pur.id
         INNER JOIN prompts p ON p.id = pi.prompt_id
         INNER JOIN users creator ON creator.id = p.creator_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE pur.buyer_id = :user_id
         ORDER BY pur.purchased_at DESC, pi.id DESC",
        [":user_id" => $userId]
    );

    echo json_encode([
        "success" => true,
        "count" => count($purchasedPrompts),
        "data" => $purchasedPrompts,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>