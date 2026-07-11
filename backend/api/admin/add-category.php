<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

date_default_timezone_set("Asia/Yangon");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$input = json_decode(file_get_contents("php://input"), true);
$categoryName = trim($input["name"] ?? "");

if (empty($categoryName)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Category name cannot be empty"]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // 1. Check for duplicate names using BaseDAO select
    $checkSql = "SELECT id FROM categories WHERE category_name = :name";
    $existing = $baseDAO->select($checkSql, [":name" => $categoryName]);
    
    if (!empty($existing)) {
        echo json_encode(["success" => false, "message" => "Category name already exists"]);
        exit;
    }

    // 2. Insert new category using BaseDAO insert
    $insertSql = "INSERT INTO categories (category_name) VALUES (:name)";
    $newId = $baseDAO->insert($insertSql, [":name" => $categoryName]);

    // 3. Clear categories cache file to keep frontend instantly updated
    $cacheFile = __DIR__ . "/../../cache/categories-list.json";
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }

    // 4. Emit WebSocket event to refresh frontend in realtime
    require_once __DIR__ . "/../../includes/socket_helper.php";
    emitSocketEvent("categories_updated", ["action" => "add", "id" => $newId]);

    echo json_encode([
        "success" => true, 
        "message" => "Category created successfully",
        "id" => $newId
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to create category", "error" => $e->getMessage()]);
}
?>
