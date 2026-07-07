<?php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../../includes/cors_headers.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$creator_id = $_POST['creator_id'] ?? null;
$title = $_POST['title'] ?? null;
$prompt_description = $_POST['prompt_description'] ?? null;
$full_prompt_content = $_POST['full_prompt_content'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$model_type = $_POST['model_type'] ?? null;
$prompt_variables = $_POST['prompt_variables'] ?? '[]';
$rawPermission = $_POST['permission'] ?? ($_POST['visibility'] ?? 'Public');

if (!$creator_id || !$title || !$prompt_description || !$full_prompt_content || !$category_id || !$model_type) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
$slug = $slug . '-' . time();

$thumbnailPath = "";

if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../uploads/prompts/thumbnail/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileTmpPath = $_FILES['thumbnail']['tmp_name'];
    $fileName = time() . '_' . basename($_FILES['thumbnail']['name']);
    $destPath = $uploadDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $thumbnailPath = 'uploads/prompts/thumbnail/' . $fileName;
    } else {
        echo json_encode(["success" => false, "message" => "Failed to move uploaded file"]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Thumbnail image is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $columns = ['creator_id', 'category_id', 'title', 'slug', 'prompt_description', 'full_prompt_content', 'thumbnail', 'model_type'];
    $placeholders = [':creator_id', ':category_id', ':title', ':slug', ':prompt_description', ':full_prompt_content', ':thumbnail', ':model_type'];
    $params = [
        ':creator_id' => $creator_id,
        ':category_id' => $category_id,
        ':title' => $title,
        ':slug' => $slug,
        ':prompt_description' => $prompt_description,
        ':full_prompt_content' => $full_prompt_content,
        ':thumbnail' => $thumbnailPath,
        ':model_type' => $model_type,
    ];
    
    if (db_has_column($pdo, 'prompts', 'prompt_variables')) {
        $columns[] = 'prompt_variables';
        $placeholders[] = ':prompt_variables';
        $params[':prompt_variables'] = $prompt_variables;
    }

    $permissionColumn = prompt_permission_column($pdo);
    if ($permissionColumn) {
        $columns[] = "`{$permissionColumn}`";
        $placeholders[] = ':permission';
        $params[':permission'] = prompt_permission_value($rawPermission, $permissionColumn);
    }

    $insert_query = "INSERT INTO prompts (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
    $promptId = $dao->insert($insert_query, $params);

    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
    ensureTodayStatsRow($pdo);

    $sql = "UPDATE dashboard_daily_stats SET total_prompts = total_prompts + 1, new_prompts_count = new_prompts_count + 1 WHERE stat_date = CURDATE()";
    $dao->update($sql,[]);

    $cacheFile = __DIR__ . "/../../cache/home-data.json";
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }

    // Trigger Real-Time update to connected React clients
    require_once __DIR__ . "/../../../websocket/socket_helper.php";
    emitSocketEvent('prompt_inserted', ['promptId' => $promptId]);

    echo json_encode([
        "success" => true,
        "message" => "Prompt created successfully!"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>