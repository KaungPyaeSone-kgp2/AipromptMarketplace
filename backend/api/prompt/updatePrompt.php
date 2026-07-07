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
    $uploadDir = __DIR__ . '/../../uploads/prompts/thumbnail/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileTmpPath = $_FILES['thumbnail']['tmp_name'];
    $fileName = time() . '_' . basename($_FILES['thumbnail']['name']);
    $destPath = $uploadDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $thumbnailPath = 'uploads/prompts/thumbnail/' . $fileName;
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
        unlink($cacheFile);
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