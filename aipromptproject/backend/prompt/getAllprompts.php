<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../database/Database.php";
require_once __DIR__ . "/../dao/BaseDAO.php";

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
// NOTE: BasicDAO.php defines class BaseDAO (despite filename). Keep instantiation as BaseDAO.


try {
    $select_query = "SELECT 
    p.id AS prompt_id,
    p.creator_id,
    u.user_name AS user_name,
    u.profile_image,
    c.category_name AS category_name,
    p.model_type,
    p.title,
    p.slug,
    p.prompt_description,
    p.full_prompt_content,
    COALESCE((
        SELECT AVG(r.rating)
        FROM reviews r
        WHERE r.prompt_id = p.id
    ), p.average_rating, 0) AS average_rating,
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
    ), p.review_count, 0) AS review_count
FROM 
    prompts p
JOIN 
    users u ON p.creator_id = u.id
JOIN 
    categories c ON p.category_id = c.id";

    $prompts = $dao->select($select_query);

    echo json_encode([
        "success" => true,
        "data" => $prompts,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
