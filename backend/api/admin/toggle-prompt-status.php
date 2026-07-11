<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
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

// Parse JSON payload
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["prompt_id"]) || !isset($input["new_status"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing prompt_id or new_status payload"]);
    exit;
}

$promptId = (int)$input["prompt_id"];
$newStatus = $input["new_status"];

// Map the string status from frontend to the boolean `is_banned` column
$isBanned = ($newStatus === "Banned") ? 1 : 0;

try {
    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    // Update the prompt's ban status
    $sql = "UPDATE prompts SET is_banned = :is_banned WHERE id = :id";
    $params = [
        ":is_banned" => $isBanned,
        ":id" => $promptId
    ];

    $baseDAO->update($sql, $params);

    $update_dashboard_sql = ($isBanned === 1) 
    ? "UPDATE dashboard_daily_stats SET total_banned_prompt = total_banned_prompt + 1 WHERE stat_date = CURDATE()" 
    : "UPDATE dashboard_daily_stats SET total_banned_prompt = total_banned_prompt - 1 WHERE stat_date = CURDATE()" ;

    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
    ensureTodayStatsRow($pdo);

    $baseDAO->update($update_dashboard_sql,[]);

    // Invalidate the cache so the list repopulates with accurate statuses
    $cacheFile = __DIR__ . "/../../cache/prompts-list.json";
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }
    
    $homeCacheFile = __DIR__ . "/../../cache/home-data.json";
    if (file_exists($homeCacheFile)) {
        unlink($homeCacheFile);
    }

    require_once __DIR__ . "/../../includes/socket_helper.php";
    emitSocketEvent('prompt_updated', ['promptId' => $promptId]);

    echo json_encode([
        "success" => true, 
        "message" => "Prompt status updated to " . $newStatus
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Failed to update prompt status", 
        "error" => $e->getMessage()
    ]);
}
?>
