<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../../includes/cors_headers.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

date_default_timezone_set("Asia/Yangon");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$cacheDir = __DIR__ . "/../../cache";
$cacheFile = $cacheDir . "/user-activity-stats.json";
$cacheSeconds = 300; // 5 Minute Cache to keep user dashboard hyper-fast

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool)$input["refresh"] : false;

// If cache file exists and isn't expired, read directly from disk (0.001 seconds)
if (!$refresh && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);
    if ($cacheAge <= $cacheSeconds) {
        $cachedData = json_decode(file_get_contents($cacheFile), true);
        if ($cachedData !== null) {
            echo json_encode([
                "success" => true,
                "data" => $cachedData,
                "cached" => true
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

    // 1. Get total active/registered user base count
    $totalUsersRow = $baseDAO->select("SELECT COUNT(id) as total FROM users WHERE user_role = 'user'", []);
    $totalUsers = isset($totalUsersRow[0]["total"]) ? (int)$totalUsersRow[0]["total"] : 0;

    // 2. Fetch login frequency grouped per user for the past 30 days
    $sql = "SELECT u.id, COUNT(ull.id) as log_count
            FROM users u
            LEFT JOIN user_login_logs ull 
                ON u.id = ull.user_id 
                AND ull.login_at >= NOW() - INTERVAL 30 DAY
            WHERE u.user_role = 'user'
            GROUP BY u.id";
            
    $userLogs = $baseDAO->select($sql, []);

    $mostActiveCount = 0;
    $normalActiveCount = 0;
    $lessActiveCount = 0;

    // 3. Classify users into tiers based on login activity counts
    foreach ($userLogs as $row) {
        $count = (int)$row["log_count"];
        if ($count >= 5) {
            $mostActiveCount++;
        } elseif ($count >= 2 && $count <= 4) {
            $normalActiveCount++;
        } else {
            $lessActiveCount++;
        }
    }

    // 4. Fallback safeguard check in case total users does not match sub-sums
    if ($totalUsers === 0) {
        $totalUsers = $mostActiveCount + $normalActiveCount + $lessActiveCount;
    }

    // 5. Calculate precise share percentages for custom radial segments
    $mostActivePercent   = $totalUsers > 0 ? round(($mostActiveCount / $totalUsers) * 100) : 0;
    $normalActivePercent = $totalUsers > 0 ? round(($normalActiveCount / $totalUsers) * 100) : 0;
    $lessActivePercent   = $totalUsers > 0 ? round(($lessActiveCount / $totalUsers) * 100) : 0;

    // 6. Format structure exactly to map straight to your UserManagement component
    $responseData = [
        "activity_stats" => [
            "most_active" => [
                "count" => $mostActiveCount,
                "percentage" => $mostActivePercent
            ],
            "normal_active" => [
                "count" => $normalActiveCount,
                "percentage" => $normalActivePercent
            ],
            "less_active" => [
                "count" => $lessActiveCount,
                "percentage" => $lessActivePercent
            ]
        ],
        "generated_at" => date("Y-m-d H:i:s")
    ];

    // Write contents to the quick-cache file for subsequent reads
    file_put_contents($cacheFile, json_encode($responseData));

    echo json_encode([
        "success" => true,
        "data" => $responseData,
        "cached" => false
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to load user management tier calculations",
        "error" => $e->getMessage()
    ]);
}
