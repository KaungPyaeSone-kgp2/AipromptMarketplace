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
$cacheFile = $cacheDir . "/prompts-list.json";
$cacheSeconds = 300; // 5-minute cache

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

// 1. Return Cache if Valid
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

// Helper to format image URLs
function formatImageUrl($rawPath) {
    if (empty($rawPath)) return null;
    return "http://localhost:8000/" . ltrim($rawPath, '/');
}

try {
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }

    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // 2. Fetch all Prompts, Creator Info, AND the live totals
    $sqlPrompts = "SELECT 
                p.id, p.title, p.prompt_description, p.full_prompt_content, p.thumbnail, 
                p.save_count, p.review_count, p.average_rating,
                p.is_banned, p.created_at, 
                u.user_name AS creator_name, u.profile_image AS creator_image, u.user_email AS creator_email
            FROM prompts p
            INNER JOIN users u ON p.creator_id = u.id
            ORDER BY p.created_at DESC";

    $prompts = $baseDAO->select($sqlPrompts, []);

    // 3. Fetch Analytics strictly for the 7-day Line Chart
    $sqlStats = "SELECT prompt_id, stats_date, total_saves, total_reviews, average_rating 
                 FROM prompt_stats 
                 WHERE stats_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                 ORDER BY stats_date ASC";
    
    $rawStats = $baseDAO->select($sqlStats, []);

    // Group the stats by prompt_id into arrays for the frontend charts
    $analyticsMap = [];
    foreach ($rawStats as $row) {
        $pid = $row['prompt_id'];
        if (!isset($analyticsMap[$pid])) {
            $analyticsMap[$pid] = [
                "save" => [],
                "review" => [],
                "rating" => []
            ];
        }
        $analyticsMap[$pid]["save"][] = (int)$row["total_saves"];
        $analyticsMap[$pid]["review"][] = (int)$row["total_reviews"];
        $analyticsMap[$pid]["rating"][] = (float)$row["average_rating"];
    }

    // 4. Merge Data and Format
    $formattedPrompts = array_map(function ($prompt) use ($analyticsMap) {
        $pid = $prompt["id"];
        
        // Default empty arrays if a prompt has no historical chart data yet
        $promptAnalytics = $analyticsMap[$pid] ?? [
            "save" => [0, 0, 0, 0, 0, 0, 0],
            "review" => [0, 0, 0, 0, 0, 0, 0],
            "rating" => [0, 0, 0, 0, 0, 0, 0]
        ];

        return [
            "id" => (int)$prompt["id"],
            "title" => $prompt["title"],
            "creator_name" => $prompt["creator_name"],
            "creator_email" => $prompt["creator_email"],
            "creator_image" => formatImageUrl($prompt["creator_image"]),
            "thumbnail" => formatImageUrl($prompt["thumbnail"]),
            "promptText" => $prompt["full_prompt_content"],
            "description" => $prompt["prompt_description"],
            "status" => $prompt["is_banned"] ? "Banned" : "Active",
            "created_at" => date("M d, Y h:i A", strtotime($prompt["created_at"])),
            "date" => date("M d, Y", strtotime($prompt["created_at"])),
            "time" => date("h:i A", strtotime($prompt["created_at"])),
            
            // Current totals loaded directly from the prompts table for the StatCards!
            "stats" => [
                "save" => (int)$prompt["save_count"],
                "review" => (int)$prompt["review_count"],
                "rating" => (float)$prompt["average_rating"]
            ],
            
            // 7-day historical arrays for the Line Chart
            "analytics" => $promptAnalytics
        ];
    }, $prompts);

    $responseData = ["prompts" => $formattedPrompts];

    // 5. Save to Cache
    file_put_contents($cacheFile, json_encode($responseData));

    echo json_encode(["success" => true, "source" => "database", "data" => $responseData]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to load prompts", "error" => $e->getMessage()]);
}
?>
