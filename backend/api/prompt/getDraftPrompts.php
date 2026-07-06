<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if (isset($_SERVER["REQUEST_METHOD"]) && $_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$creator_id = isset($_GET['creator_id']) ? filter_var($_GET['creator_id'], FILTER_VALIDATE_INT) : null;

if (!$creator_id || $creator_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "creator_id is required and must be a positive integer",
    ]);
    exit;
}

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

$permissionColumn = prompt_permission_column($pdo);
if (!$permissionColumn) {
    echo json_encode([
        "success" => true,
        "data" => [],
        "message" => "Draft prompts are unavailable because the current prompts table has no permission column.",
    ]);
    exit;
}

$dao = new BaseDAO($pdo);

try {
    $permissionExpr = "p.`{$permissionColumn}`";
    $draftValue = prompt_draft_value($permissionColumn);
    $promptVariablesExpr = db_column_expr($pdo, 'prompts', 'prompt_variables', 'p.prompt_variables', "'[]'");

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
    p.thumbnail,
    p.created_at,
    p.updated_at
FROM
    prompts p
JOIN
    users u ON p.creator_id = u.id
JOIN
    categories c ON p.category_id = c.id
WHERE
    p.creator_id = :creator_id AND p.`{$permissionColumn}` = :draft_value
ORDER BY
    p.updated_at DESC, p.created_at DESC";

    $drafts = $dao->select($select_query, [':creator_id' => $creator_id, ':draft_value' => $draftValue]);

    echo json_encode([
        "success" => true,
        "data" => $drafts,
    ]);
} catch (Exception $e) {
    error_log("Query Execution Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve draft prompts: " . $e->getMessage(),
    ]);
}
?>
