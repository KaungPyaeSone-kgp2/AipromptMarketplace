<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../database/Database.php";
require_once __DIR__ . "/../dao/BaseDAO.php";

// Get form data
$creator_id = $_POST['creator_id'] ?? null;
$title = $_POST['title'] ?? null;
$prompt_description = $_POST['prompt_description'] ?? null;
$full_prompt_content = $_POST['full_prompt_content'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$model_type = $_POST['model_type'] ?? null;
$sale_coin = $_POST['sale_coin'] ?? 0;
$prompt_variables = $_POST['prompt_variables'] ?? '[]';

if (!$creator_id || !$title || !$prompt_description || !$full_prompt_content || !$category_id || !$model_type) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Generate a slug from the title
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
$slug = $slug . '-' . time(); // Append time to ensure uniqueness

$thumbnailPath = "";

if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../users/uploads/prompts/thumbnail/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileTmpPath = $_FILES['thumbnail']['tmp_name'];
    $fileName = time() . '_' . basename($_FILES['thumbnail']['name']);
    $destPath = $uploadDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $destPath)) {
        // Path relative to backend root
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

    $insert_query = "INSERT INTO prompts 
        (creator_id, category_id, title, slug, prompt_description, full_prompt_content, prompt_variables, thumbnail, sale_coin, model_type) 
        VALUES 
        (:creator_id, :category_id, :title, :slug, :prompt_description, :full_prompt_content, :prompt_variables, :thumbnail, :sale_coin, :model_type)";
    
    $params = [
        ':creator_id' => $creator_id,
        ':category_id' => $category_id,
        ':title' => $title,
        ':slug' => $slug,
        ':prompt_description' => $prompt_description,
        ':full_prompt_content' => $full_prompt_content,
        ':prompt_variables' => $prompt_variables,
        ':thumbnail' => $thumbnailPath,
        ':sale_coin' => $sale_coin,
        ':model_type' => $model_type
    ];

    $dao->insert($insert_query, $params);

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
