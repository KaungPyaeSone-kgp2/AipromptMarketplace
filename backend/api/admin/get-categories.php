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

$cacheDir = __DIR__ . "/../../cache";
$cacheFile = $cacheDir . "/categories-list.json";
$cacheSeconds = 300; 

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

if (!$refresh && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge <= $cacheSeconds) {
        $cachedData = json_decode(file_get_contents($cacheFile), true);
        if ($cachedData !== null) {
            echo json_encode(["success" => true, "source" => "cache", "data" => $cachedData]);
            exit;
        }
    }
}

try {
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }

    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // 1. Fetch categories and counts
    $sqlCats = "SELECT 
                c.id, 
                c.category_name AS name, 
                c.created_at,
                c.updated_at,
                COUNT(p.id) AS total
            FROM categories c
            LEFT JOIN prompts p ON c.id = p.category_id
            GROUP BY c.id, c.category_name, c.created_at, c.updated_at
            ORDER BY c.created_at DESC";

    $categories = $baseDAO->select($sqlCats, []);

    // 2. Fetch all prompt titles lightweight to avoid string limit truncation
    $sqlPrompts = "SELECT category_id, title FROM prompts ORDER BY created_at DESC";
    $rawPrompts = $baseDAO->select($sqlPrompts, []);

    // Group the titles by category_id
    $promptMap = [];
    foreach ($rawPrompts as $row) {
        $catId = $row['category_id'];
        if (!isset($promptMap[$catId])) {
            $promptMap[$catId] = [];
        }
        $promptMap[$catId][] = $row['title'];
    }

    // 3. Merge and Format Data
    $formattedCategories = array_map(function ($cat) use ($promptMap) {
        return [
            "id" => (int)$cat["id"],
            "name" => $cat["name"],
            "total" => (int)$cat["total"],
            "createdAt" => date("M d, Y", strtotime($cat["created_at"])),
            "createdTime" => date("h:i A", strtotime($cat["created_at"])),
            "lastUpdated" => date("M d, Y h:i A", strtotime($cat["updated_at"])), 
            "prompts" => $promptMap[$cat["id"]] ?? [] // Injects the array of titles seamlessly
        ];
    }, $categories);

    $responseData = ["categories" => $formattedCategories];

    file_put_contents($cacheFile, json_encode($responseData));

    echo json_encode(["success" => true, "source" => "database", "data" => $responseData]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to load categories", "error" => $e->getMessage()]);
}
?>
