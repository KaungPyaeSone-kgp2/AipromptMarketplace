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
require_once __DIR__ . "/../../includes/SupabaseStorage.php";

$prompt_id = filter_input(INPUT_POST, "prompt_id", FILTER_VALIDATE_INT);
$creator_id = filter_input(INPUT_POST, "creator_id", FILTER_VALIDATE_INT);
$prompt_variables = $_POST["prompt_variables"] ?? null;
$rawPermission = $_POST['permission'] ?? ($_POST['visibility'] ?? null);

if (!$prompt_id || !$creator_id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "prompt_id and creator_id are required",
    ]);
    exit;
}

if ($prompt_variables !== null) {
    json_decode($prompt_variables, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "prompt_variables must be valid JSON",
        ]);
        exit;
    }
}

$thumbnailPath = null;
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['thumbnail']['tmp_name'];
    $fileType = $_FILES['thumbnail']['type'];
    $fileName = time() . '_' . basename($_FILES['thumbnail']['name']);
    $destPath = 'prompts/thumbnail/' . $fileName;

    $supabase = new SupabaseStorage();
    $uploadedUrl = $supabase->upload($fileTmpPath, $destPath, $fileType);

    if ($uploadedUrl) {
        $thumbnailPath = $uploadedUrl;
    }
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $prompt = $dao->select(
        "SELECT id, thumbnail FROM prompts WHERE id = :prompt_id AND creator_id = :creator_id LIMIT 1",
        [
            ":prompt_id" => $prompt_id,
            ":creator_id" => $creator_id,
        ]
    );

    if (count($prompt) === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Prompt not found or you are not allowed to edit it",
        ]);
        exit;
    }

    $setClauses = ["updated_at = CURRENT_TIMESTAMP"];
    $updateParams = [
        ":prompt_id" => $prompt_id,
        ":creator_id" => $creator_id,
    ];

    if ($prompt_variables !== null && db_has_column($pdo, 'prompts', 'prompt_variables')) {
        $setClauses[] = "prompt_variables = :prompt_variables";
        $updateParams[":prompt_variables"] = $prompt_variables;
    }

    $title = $_POST['title'] ?? null;
    if ($title !== null) {
        $setClauses[] = "title = :title";
        $updateParams[":title"] = $title;
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $slug = $slug . '-' . time();
        $setClauses[] = "slug = :slug";
        $updateParams[":slug"] = $slug;
    }
    
    $prompt_description = $_POST['prompt_description'] ?? null;
    if ($prompt_description !== null) {
        $setClauses[] = "prompt_description = :prompt_description";
        $updateParams[":prompt_description"] = $prompt_description;
    }
    
    $full_prompt_content = $_POST['full_prompt_content'] ?? null;
    if ($full_prompt_content !== null) {
        $setClauses[] = "full_prompt_content = :full_prompt_content";
        $updateParams[":full_prompt_content"] = $full_prompt_content;
    }
    
    $category_id = $_POST['category_id'] ?? null;
    if ($category_id !== null) {
        $setClauses[] = "category_id = :category_id";
        $updateParams[":category_id"] = $category_id;
    }
    
    $model_type = $_POST['model_type'] ?? null;
    if ($model_type !== null) {
        $setClauses[] = "model_type = :model_type";
        $updateParams[":model_type"] = $model_type;
    }

    if ($thumbnailPath !== null) {
        $setClauses[] = "thumbnail = :thumbnail";
        $updateParams[":thumbnail"] = $thumbnailPath;
    }

    $permissionColumn = prompt_permission_column($pdo);
    if ($permissionColumn && $rawPermission !== null) {
        $setClauses[] = "`{$permissionColumn}` = :permission";
        $updateParams[":permission"] = prompt_permission_value($rawPermission, $permissionColumn);
    }

    $dao->update(
        "UPDATE prompts SET " . implode(", ", $setClauses) . " WHERE id = :prompt_id AND creator_id = :creator_id",
        $updateParams
    );

    $cacheFile = __DIR__ . "/../../cache/home-data.json";
    if (file_exists($cacheFile)) {
        @unlink($cacheFile);
    }

    // Trigger Real-Time update to connected React clients
    require_once __DIR__ . "/../../../websocket/socket_helper.php";
    emitSocketEvent('prompt_updated', ['promptId' => $prompt_id]);

    echo json_encode([
        "success" => true,
        "message" => "Prompt updated successfully",
        "thumbnail" => $thumbnailPath !== null ? $thumbnailPath : ($prompt[0]['thumbnail'] ?? null),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage(),
    ]);
}
?>