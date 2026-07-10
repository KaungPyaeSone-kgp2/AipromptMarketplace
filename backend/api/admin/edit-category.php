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
$id = (int)($input["id"] ?? 0);
$categoryName = trim($input["name"] ?? "");

if ($id === 0 || empty($categoryName)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing category ID or name"]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // 1. Check if the name is taken by a DIFFERENT category ID using BaseDAO select
    $checkSql = "SELECT id FROM categories WHERE category_name = :name AND id != :id";
    $conflicting = $baseDAO->select($checkSql, [
        ":name" => $categoryName, 
        ":id" => $id
    ]);
    
    if (!empty($conflicting)) {
        echo json_encode(["success" => false, "message" => "Another category already uses this name"]);
        exit;
    }

    // 2. Perform database update using BaseDAO update
    $updateSql = "UPDATE categories SET category_name = :name WHERE id = :id";
    $baseDAO->update($updateSql, [
        ":name" => $categoryName,
        ":id" => $id
    ]);

    // 3. Invalidate categories cache
    $cacheFile = __DIR__ . "/../../cache/categories-list.json";
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }

    // 4. Emit WebSocket event to refresh frontend in realtime
    require_once __DIR__ . "/../../../websocket/socket_helper.php";
    emitSocketEvent("categories_updated", ["action" => "edit", "id" => $id]);

    echo json_encode(["success" => true, "message" => "Category updated successfully"]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update category", "error" => $e->getMessage()]);
}
?>
