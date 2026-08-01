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

if (isset($_FILES['thumbnail'])) {
    if ($_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['thumbnail']['tmp_name'];
        $fileType = $_FILES['thumbnail']['type'];
        $safeFilename = preg_replace('/[^A-Za-z0-9.\-]/', '_', basename($_FILES['thumbnail']['name']));
        $fileName = time() . '_' . $safeFilename;
        $destPath = 'prompts/thumbnail/' . $fileName;

        $supabase = new SupabaseStorage();
        try {
            $uploadedUrl = $supabase->upload($fileTmpPath, $destPath, $fileType);
            if ($uploadedUrl) {
                $thumbnailPath = $uploadedUrl;
            } else {
                echo json_encode(["success" => false, "message" => "Failed to upload file to Supabase"]);
                exit;
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
            exit;
        }
    } else if ($_FILES['thumbnail']['error'] === UPLOAD_ERR_INI_SIZE || $_FILES['thumbnail']['error'] === UPLOAD_ERR_FORM_SIZE) {
        echo json_encode(["success" => false, "message" => "Image size is over the server limit. Please upload a smaller image."]);
        exit;
    } else if ($_FILES['thumbnail']['error'] !== UPLOAD_ERR_NO_FILE) {
        echo json_encode(["success" => false, "message" => "Image upload failed with error code: " . $_FILES['thumbnail']['error']]);
        exit;
    } else {
        echo json_encode(["success" => false, "message" => "Thumbnail image is required"]);
        exit;
    }
} else {
    if (empty($_POST) && empty($_FILES) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
        echo json_encode(["success" => false, "message" => "The uploaded image file is too large for the server. Maximum size allowed is 25MB."]);
        exit;
    }
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

    $image_alignment = $_POST['image_alignment'] ?? null;
    if ($image_alignment !== null && db_has_column($pdo, 'prompts', 'image_alignment')) {
        $columns[] = 'image_alignment';
        $placeholders[] = ':image_alignment';
        $params[':image_alignment'] = $image_alignment;
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
        @unlink($cacheFile);
    }

    // Trigger Real-Time update to connected React clients
    $socketHelperPath = __DIR__ . "/../../includes/socket_helper.php";
    if (file_exists($socketHelperPath)) {
        require_once $socketHelperPath;
        if (function_exists('emitSocketEvent')) {
            emitSocketEvent('prompt_inserted', ['promptId' => $promptId]);
        }
    }

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

