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
$cacheFile = $cacheDir . "/dashboard-top-cards.json";
$cacheSeconds = 60;

$input = json_decode(file_get_contents("php://input"), true);
$refresh = isset($input["refresh"]) ? (bool) $input["refresh"] : false;

if (!$refresh && file_exists($cacheFile)) {
    $cacheAge = time() - filemtime($cacheFile);

    if ($cacheAge <= $cacheSeconds) {
        $cachedData = json_decode(file_get_contents($cacheFile), true);

        if ($cachedData) {
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
    $database = new Database();
    $pdo = $database->connect();
    $baseDAO = new BaseDAO($pdo);

    $todayDate = date("Y-m-d");
    $yesterdayDate = date("Y-m-d", strtotime($todayDate . " -1 day"));

    // Auto-create today's row if it doesn't exist yet
    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
    ensureTodayStatsRow($pdo);

    $rows = $baseDAO->select(
        "SELECT *
         FROM dashboard_daily_stats
         WHERE stat_date IN (:today, :yesterday)",
        [
            ":today" => $todayDate,
            ":yesterday" => $yesterdayDate
        ]
    );

    $todayStats = findStatsByDate($rows, $todayDate);
    $yesterdayStats = findStatsByDate($rows, $yesterdayDate);

    $data = [
        "stat_date" => $todayDate,
        "compare_date" => $yesterdayDate,
        "cards" => [
            // "total_users" => buildCard(
            //     "Total Users",
            //     (int) $todayStats["total_users"],
            //     (int) $todayStats["total_users"],
            //     (int) $yesterdayStats["total_users"]
            // ),
            // "total_creators" => buildCard(
            //     "Total Creators",
            //     (int) $todayStats["total_creators"],
            //     (int) $todayStats["total_creators"],
            //     (int) $yesterdayStats["total_creators"]
            // ),
            // "platform_earnings" => buildCard(
            //     "Platform Earnings",
            //     (int) $todayStats["total_platform_fee_coin"],
            //     (int) $todayStats["total_platform_fee_coin"],
            //     (int) $yesterdayStats["total_platform_fee_coin"]
            // ),
            // "pending_reports" => buildCard(
            //     "Pending Reports",
            //     (int) $todayStats["current_pending_reports"],
            //     (int) $todayStats["current_pending_reports"],
            //     (int) $yesterdayStats["current_pending_reports"]
            // )
            "total_users" => buildCard(
                "Total Users",
                (int) $todayStats["total_users"],
                (int) $todayStats["total_users"],
                (int) $yesterdayStats["total_users"]
            ),
            "total_prompts" => buildCard(
                "Total Prompts",
                (int) $todayStats["total_prompts"],
                (int) $todayStats["total_prompts"],
                (int) $yesterdayStats["total_prompts"]
            ),
            "banned_stats" => [
                "title" => "Banned (Users / Prompts)",
                "is_ban_card" => true,
                "users_value" => (int) $todayStats["total_banned_users"],
                "prompts_value" => (int) $todayStats["total_banned_prompt"],
                "users_trend" => formatTrend(calculatePercentageChange((int) $todayStats["total_banned_users"], (int) $yesterdayStats["total_banned_users"])),
                "prompts_trend" => formatTrend(calculatePercentageChange((int) $todayStats["total_banned_prompt"], (int) $yesterdayStats["total_banned_prompt"])),
                "users_is_up" => calculatePercentageChange((int) $todayStats["total_banned_users"], (int) $yesterdayStats["total_banned_users"]) >= 0,
                "prompts_is_up" => calculatePercentageChange((int) $todayStats["total_banned_prompt"], (int) $yesterdayStats["total_banned_prompt"]) >= 0
            ],
            "pending_reports" => buildCard(
                "Pending Reports",
                (int) $todayStats["total_pending_reports"],
                (int) $todayStats["total_pending_reports"],
                (int) $yesterdayStats["total_pending_reports"]
            )
        ]
    ];

    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }

    file_put_contents($cacheFile, json_encode($data));

    echo json_encode([
        "success" => true,
        "source" => "database",
        "data" => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to load dashboard top card stats"
    ]);
}

function findStatsByDate($rows, $date)
{
    foreach ($rows as $row) {
        if ($row["stat_date"] === $date) {
            return $row;
        }
    }

    return [
        // "total_users" => 0,
        // "total_creators" => 0,
        // "total_platform_fee_coin" => 0,
        // "current_pending_reports" => 0,
        // "new_users_count" => 0,
        // "new_creators_count" => 0,
        // "today_platform_fee_coin" => 0,
        // "new_reports_count" => 0
        "total_users" => 0,
        "total_prompts" => 0,
        "total_banned_users" => 0,
        "total_banned_prompt" => 0,
        "total_pending_reports" => 0,
        "new_users_count" => 0,
        "new_prompts_count" => 0,
        "new_banned_users_count" => 0,
        "new_banned_prompts_count" => 0,
        "new_pending_reports" => 0
    ];
}

function buildCard($title, $value, $todayCompareValue, $yesterdayCompareValue)
{
    $percentage = calculatePercentageChange(
        $todayCompareValue,
        $yesterdayCompareValue
    );

    return [
        "title" => $title,
        "value" => $value,
        "today_compare_value" => $todayCompareValue,
        "yesterday_compare_value" => $yesterdayCompareValue,
        "percentage" => $percentage,
        "trend" => formatTrend($percentage),
        "is_up" => $percentage >= 0
    ];
}

function calculatePercentageChange($todayValue, $yesterdayValue)
{
    if ($yesterdayValue === 0) {
        return $todayValue > 0 ? 100 : 0;
    }

    return round((($todayValue - $yesterdayValue) / $yesterdayValue) * 100, 1);
}

function formatTrend($percentage)
{
    $sign = $percentage > 0 ? "+" : "";

    return $sign . $percentage . "%";
}
