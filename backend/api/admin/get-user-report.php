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
$cacheFile = $cacheDir . "/user-reports.json";
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

    // Double join on users to get both reporter and reported user details[cite: 3]
    $sql = "SELECT 
                ur.id, 
                ru.user_name AS reporter_name, 
                ru.profile_image AS reporter_image,
                tu.user_name AS reported_user_name,
                tu.profile_image AS reported_user_image,
                ur.reason, 
                ur.report_description, 
                ur.image_evidence, 
                ur.status, 
                ur.created_at 
            FROM user_reports ur
            JOIN users ru ON ur.reporter_id = ru.id
            JOIN users tu ON ur.reported_user_id = tu.id
            ORDER BY ur.created_at DESC";

    $reports = $baseDAO->select($sql, []);

    // Format the data explicitly for the frontend[cite: 4]
    $formattedReports = array_map(function ($report) {
        $formatImage = function($path) {
            return !empty($path) ? (strpos($path, 'http') === 0 ? $path : "http://localhost:8000/" . ltrim($path, '/')) : "https://i.pravatar.cc/150";
        };
        
        $formatEvidence = function($path) {
            return !empty($path) ? (strpos($path, 'http') === 0 ? $path : "http://localhost:8000/" . ltrim($path, '/')) : null;
        };

        return [
            "id" => (int)$report["id"],
            "reporter_name" => $report["reporter_name"],
            "reporter_image" => $formatImage($report["reporter_image"]),
            "reported_user_name" => $report["reported_user_name"],
            "reported_user_image" => $formatImage($report["reported_user_image"]),
            "reason" => $report["reason"],
            "report_description" => $report["report_description"],
            "image_evidence" => $formatEvidence($report["image_evidence"]),
            "status" => $report["status"],
            "created_at" => $report["created_at"] // Standard timestamp format[cite: 3]
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
        "message" => "Failed to load user reports",
        "error" => $e->getMessage()
    ]);
}