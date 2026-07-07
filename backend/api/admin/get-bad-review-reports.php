<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../../includes/cors_headers.php';
require_once __DIR__ . '/../../includes/url_helper.php';
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
$cacheFile = $cacheDir . "/bad-review-reports.json";
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

    // Join tables to get reporter and review author details[cite: 1]
    $sql = "SELECT 
                brr.id, 
                ru.user_name AS reporter_name, 
                ru.profile_image AS reporter_image,
                au.user_name AS review_author_name,
                au.profile_image AS review_author_image,
                r.review_text,
                brr.reason, 
                brr.report_description, 
                brr.image_evidence, 
                brr.status, 
                brr.created_at 
            FROM bad_review_reports brr
            JOIN users ru ON brr.reporter_id = ru.id
            JOIN reviews r ON brr.review_id = r.id
            JOIN users au ON r.user_id = au.id
            ORDER BY brr.created_at DESC";

    $reports = $baseDAO->select($sql, []);

    // Format the data explicitly for the frontend[cite: 4]
    $formattedReports = array_map(function ($report) {
        $formatImage = function($path) {
            return !empty($path) ? (strpos($path, 'http') === 0 ? $path : getBackendBaseUrl() . "/" . ltrim($path, '/')) : "https://i.pravatar.cc/150";
        };

        return [
            "id" => (int)$report["id"],
            "reporter_name" => $report["reporter_name"],
            "reporter_image" => $formatImage($report["reporter_image"]),
            "review_author_name" => $report["review_author_name"],
            "review_author_image" => $formatImage($report["review_author_image"]),
            "review_text" => $report["review_text"],
            "reason" => $report["reason"],
            "report_description" => $report["report_description"],
            "image_evidence" => !empty($report["image_evidence"]) ? (strpos($report["image_evidence"], 'http') === 0 ? $report["image_evidence"] : getBackendBaseUrl() . "/" . ltrim($report["image_evidence"], '/')) : null,
            "status" => $report["status"],
            "created_at" => $report["created_at"] // Kept as standard string for JS parsing[cite: 1]
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
        "message" => "Failed to load bad review reports",
        "error" => $e->getMessage()
    ]);
}