<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    $requestData = json_decode(file_get_contents("php://input"), true);
    $userId = isset($requestData["user_id"]) ? filter_var($requestData["user_id"], FILTER_VALIDATE_INT) : null;
    if (!$userId || $userId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
        exit;
    }

    $wishListExpr = "(SELECT COUNT(*) FROM wishlists wc WHERE wc.prompt_id = p.id)";
    $reviewCountExpr = db_column_expr($pdo, 'prompts', 'review_count', 'p.review_count', '(SELECT COUNT(*) FROM reviews rc WHERE rc.prompt_id = p.id AND (rc.is_banned IS NULL OR rc.is_banned = 0))');

    $permissionColumn = prompt_permission_column($pdo);
    $draftValue = $permissionColumn ? prompt_draft_value($permissionColumn) : 'draft';
    
    $whereSql = "w.user_id = :user_id AND (p.is_banned IS NULL OR p.is_banned = 0)";
    $params = [":user_id" => $userId];
    
    if ($permissionColumn) {
        $whereSql .= " AND p.`{$permissionColumn}` != :draft_value";
        $params[":draft_value"] = $draftValue;
    }

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
            p.model_type,
            {$wishListExpr} AS save_count,
            {$reviewCountExpr} AS review_count,
            p.average_rating,
            p.created_at,
            creator.user_name AS creator_name,
            creator.profile_image,
            c.category_name
         FROM wishlists w
         INNER JOIN prompts p ON p.id = w.prompt_id
         INNER JOIN users creator ON creator.id = p.creator_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE {$whereSql}
         ORDER BY w.created_at DESC",
        $params
    );

    echo json_encode(["success" => true, "data" => $wishlists]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
