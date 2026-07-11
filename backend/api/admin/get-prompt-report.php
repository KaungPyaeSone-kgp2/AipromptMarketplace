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
$cacheFile = $cacheDir . "/prompt-reports.json";
$cacheSeconds = 300; // 5-minute cache[cite: 4]

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

// Return cached data if valid and refresh is not forced[cite: 4]
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

    $sql = "SELECT 
                pr.id, 
                ru.user_name AS reporter_name, 
                ru.profile_image AS reporter_image,
                p.title AS prompt_title,
                au.user_name AS prompt_author_name,
                au.profile_image AS prompt_author_image,
                pr.reason, 
                pr.report_description, 
                pr.image_evidence, 
                pr.status, 
                pr.created_at 
            FROM prompt_reports pr
            JOIN users ru ON pr.reporter_id = ru.id
            JOIN prompts p ON pr.prompt_id = p.id
            JOIN users au ON p.creator_id = au.id
            ORDER BY pr.created_at DESC";

    $reports = $baseDAO->select($sql, []);

    // Format the data explicitly for the frontend[cite: 4]
    $formattedReports = array_map(function ($report) {
        $formatImage = function($path) {
            return !empty($path) ? (strpos($path, 'http') === 0 ? $path : ltrim($path, '/')) : "https://i.pravatar.cc/150";
        };
        
        $formatEvidence = function($path) {
            return !empty($path) ? (strpos($path, 'http') === 0 ? $path : ltrim($path, '/')) : null;
        };

        return [
            "id" => (int)$report["id"],
            "reporter_name" => $report["reporter_name"],
            "reporter_image" => $formatImage($report["reporter_image"]),
            "prompt_title" => $report["prompt_title"],
            "prompt_author_name" => $report["prompt_author_name"],
            "prompt_author_image" => $formatImage($report["prompt_author_image"]),
            "reason" => $report["reason"],
            "report_description" => $report["report_description"],
            "image_evidence" => $formatEvidence($report["image_evidence"]),
            "status" => $report["status"],
            "created_at" => $report["created_at"]
        ];
    }, $reports);

    $responseData = ["reports" => $formattedReports];

    // Save to cache[cite: 4]
    file_put_contents($cacheFile, json_encode($responseData));

    echo json_encode([
        "success" => true,
        "source" => "database",
        "data" => $responseData
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load prompt reports",
        "error" => $e->getMessage()
    ]);
}