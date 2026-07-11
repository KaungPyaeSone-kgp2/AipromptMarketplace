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
$cacheFile = $cacheDir . "/users-list.json";
$cacheSeconds = 300; // 5-minute cache

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

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

    // Fetch required fields for the table
    $sql = "SELECT id, user_name, user_email, profile_image, is_banned, created_at 
            FROM users WHERE user_role = 'user' 
            ORDER BY created_at DESC";

    $users = $baseDAO->select($sql, []);

    // Format the data explicitly for the frontend
    $formattedUsers = array_map(function ($user) {
        return [
            "id" => (int)$user["id"],
            "name" => $user["user_name"],
            "email" => $user["user_email"],
            "profile_image" => !empty($user["profile_image"])
                ? ltrim($user["profile_image"], '/')
                : null,
            "status" => $user["is_banned"] ? "Ban" : "Active", // Translate boolean to your exact requested text
            "created_at" => date("M d, Y h:i A", strtotime($user["created_at"]))
        ];
    }, $users);

    $responseData = ["users" => $formattedUsers];

    // Save to cache
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
        "message" => "Failed to load users",
        "error" => $e->getMessage()
    ]);
}
