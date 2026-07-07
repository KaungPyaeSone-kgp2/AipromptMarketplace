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
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$input = json_decode(file_get_contents("php://input"), true);

// Validate inputs
if (!isset($input["user_id"]) || !isset($input["new_status"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

$userId = (int)$input["user_id"];
$newStatus = $input["new_status"] === "Ban" ? 1 : 0; // Convert frontend text to DB boolean

try {
    $database = new Database();
    $pdo = $database->connect();
    
    $baseDAO = new BaseDAO($pdo);
    
    $sql = "UPDATE users SET is_banned = :is_banned WHERE id = :id";
    $params = [
        ":is_banned" => $newStatus,
        ":id" => $userId
    ];

    $update_dashboard_sql = ($newStatus === 1) 
    ? "UPDATE dashboard_daily_stats SET total_banned_users = total_banned_users + 1 WHERE stat_date = CURDATE()" 
    : "UPDATE dashboard_daily_stats SET total_banned_users = total_banned_users - 1 WHERE stat_date = CURDATE()" ;

    if($baseDAO->update($sql,$params)) {

        require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
        ensureTodayStatsRow($pdo);

        if($baseDAO->update($update_dashboard_sql,[])) {

            clearCaches();

            echo json_encode([
                "success" => true,
                "message" => "User not found or status is already set"
            ]);
        }
        else {
            echo json_encode([
            "success" => false,
            "message" => "Data inserting into Dashboard Daily Stats is filled"
        ]);
        }
    }else {
        echo json_encode([
            "success" => false,
            "message" => "User not found or status is already set"
        ]);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update user status",
        "error" => $e->getMessage()
    ]);
}

// Function to delete cache files so the dashboard stats update immediately
function clearCaches() {
    $cacheDir = __DIR__ . "/../../cache";
    $filesToDelete = [
        $cacheDir . "/users-list.json",
        $cacheDir . "/dashboard-top-cards.json",
        $cacheDir . "/user-activity-stats.json"
    ];

    foreach ($filesToDelete as $file) {
        if (file_exists($file)) {
            unlink($file);
        }
    }
}
?>
