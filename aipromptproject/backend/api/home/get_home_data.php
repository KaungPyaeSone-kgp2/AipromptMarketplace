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
$cacheFile = $cacheDir . "/home-data.json";
$cacheSeconds = 300; // 5-minute cache

$input = json_decode(file_get_contents("php://input"), true);
$action = isset($input["action"]) ? $input["action"] : null;
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

// Ensure this endpoint is only processing the intended action
if ($action !== "fetch_home_data") {
    echo json_encode(["success" => false, "message" => "Invalid or missing action parameter"]);
    exit;
}

// Return cached data if valid and refresh is not forced
if (!$refresh && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge <= $cacheSeconds) {
        $cachedData = json_decode(file_get_contents($cacheFile), true);
        if ($cachedData !== null) {
            echo json_encode([
                "success" => true,
                "source" => "cache",
                "data" => $cachedData
            ]);
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

    // 1. Fetch all Public, unbanned prompts
    // Excluding is_banned, created_at, updated_at from the SELECT list as requested
    $promptSql = "
        SELECT 
            id, 
            creator_id, 
            category_id, 
            title, 
            slug, 
            prompt_description, 
            full_prompt_content, 
            thumbnail, 
            model_type, 
            permission, 
            save_count, 
            review_count, 
            average_rating
        FROM prompts 
        WHERE permission = 'Public' AND is_banned = 0
        ORDER BY save_count DESC, average_rating DESC
    ";
    
    $rawPrompts = $baseDAO->select($promptSql, []);

    // Format the prompts specifically for the React frontend
    $formattedPrompts = array_map(function ($p) {
        $thumbnail = $p['thumbnail'];
        // Ensure the path is a fully qualified URL for the React frontend
        if (!str_starts_with($thumbnail, 'http')) {
            $thumbnail = "http://localhost:8000/" . ltrim($thumbnail, '/');
        }

        return [
            'id' => (int)$p['id'],
            'creator_id' => (int)$p['creator_id'],
            'category_id' => (int)$p['category_id'],
            'title' => $p['title'],
            'slug' => $p['slug'],
            'prompt_description' => $p['prompt_description'],
            'full_prompt_content' => $p['full_prompt_content'],
            'thumbnail' => $thumbnail,
            'model_type' => $p['model_type'],
            'permission' => $p['permission'],
            'save_count' => (int)$p['save_count'],
            'review_count' => (int)$p['review_count'],
            'average_rating' => (float)$p['average_rating']
        ];
    }, $rawPrompts);

    // 2. Fetch all categories
    // Excluding created_at and updated_at as requested
    $categorySql = "
        SELECT id, category_name 
        FROM categories
    ";
    
    $rawCategories = $baseDAO->select($categorySql, []);
    
    $formattedCategories = array_map(function ($c) {
        return [
            'id' => (int)$c['id'],
            'category_name' => $c['category_name']
        ];
    }, $rawCategories);

    // 3. Compile the final payload
    $homeData = [
        'prompts' => $formattedPrompts,
        'categories' => $formattedCategories
    ];

    // Save to cache
    file_put_contents($cacheFile, json_encode($homeData));

    echo json_encode([
        "success" => true,
        "source" => "database",
        "data" => $homeData
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load home data",
        "error" => $e->getMessage()
    ]);
}
