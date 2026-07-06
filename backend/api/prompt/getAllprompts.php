<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

try {
    $db = new Database();
    $pdo = $db->connect();
} catch (Exception $e) {
    error_log("Database Connection Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage(),
    ]);
    exit;
}

$dao = new BaseDAO($pdo);

try {
    $permissionColumn = prompt_permission_column($pdo);
    $permissionExpr = $permissionColumn ? "p.`{$permissionColumn}`" : "'Public'";
    $draftValue = prompt_draft_value($permissionColumn);
    $whereSql = $permissionColumn ? "WHERE p.`{$permissionColumn}` != :draft_value AND (p.is_banned IS NULL OR p.is_banned = 0)" : "WHERE (p.is_banned IS NULL OR p.is_banned = 0)";
    $params = $permissionColumn ? [':draft_value' => $draftValue] : [];

    $promptVariablesExpr = db_column_expr($pdo, 'prompts', 'prompt_variables', 'p.prompt_variables', "'[]'");
    $wishListExpr = db_column_expr($pdo, 'prompts', 'save_count', 'p.save_count', '(SELECT COUNT(*) FROM wishlists w WHERE w.prompt_id = p.id)');
    $reviewCountExpr = db_column_expr($pdo, 'prompts', 'review_count', 'p.review_count', '(SELECT COUNT(*) FROM reviews r WHERE r.prompt_id = p.id AND (r.is_banned IS NULL OR r.is_banned = 0))');

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
    {$promptVariablesExpr} AS prompt_variables,
    {$permissionExpr} AS permission,
    {$permissionExpr} AS visibility,
    COALESCE((
        SELECT AVG(r.rating)
        FROM reviews r
        WHERE r.prompt_id = p.id AND (r.is_banned IS NULL OR r.is_banned = 0)
    ), p.average_rating, 0) AS average_rating,
    p.thumbnail,
    {$wishListExpr} AS save_count,
    {$reviewCountExpr} AS review_count
FROM
    prompts p
JOIN
    users u ON p.creator_id = u.id
JOIN
    categories c ON p.category_id = c.id
{$whereSql}";

    $prompts = $dao->select($select_query, $params);

    echo json_encode([
        "success" => true,
        "data" => $prompts,
    ]);
} catch (Exception $e) {
    error_log("Query Execution Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve prompts: " . $e->getMessage(),
    ]);
}
?>
