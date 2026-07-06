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

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);

    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$input = json_decode(file_get_contents("php://input"), true);

// $earningsFilter = $input["earnings_filter"] ?? "7days";
// $usersFilter = $input["users_filter"] ?? "7days";
// $refresh = isset($input["refresh"]) ? (bool) $input["refresh"] : false;

$promptsFilter = $input["prompts_filter"] ?? "7days";
$usersFilter = $input["users_filter"] ?? "7days";
$refresh = isset($input["refresh"]) ? (bool) $input["refresh"] : false;

$allowedFilters = ["7days", "month", "year"];

if (
    !in_array($promptsFilter, $allowedFilters) ||
    !in_array($usersFilter, $allowedFilters)
) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid chart filter"
    ]);

    exit;
}

$cacheDir = __DIR__ . "/../../cache";
$cacheFile = $cacheDir . "/dashboard-charts-{$promptsFilter}-{$usersFilter}.json";
$cacheSeconds = 60;

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

    $data = [
        // "earnings" => buildChartData(
        //     $baseDAO,
        //     $earningsFilter,
        //     "today_platform_fee_coin"
        // ),
        // "users" => buildChartData(
        //     $baseDAO,
        //     $usersFilter,
        //     "new_users_count"
        // )
        "prompts" => buildChartData($baseDAO, $promptsFilter, "new_prompts_count"),
        "users" => buildChartData($baseDAO, $usersFilter, "new_users_count")
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
        "message" => "Failed to load dashboard charts"
    ]);
}

function buildChartData($baseDAO, $filter, $column) {
    if ($filter === "7days") {
        return buildLastSevenDaysChart($baseDAO, $column);
    }

    if ($filter === "month") {
        return buildLastFourWeeksChart($baseDAO, $column);
    }

    return buildCurrentYearChart($baseDAO, $column);
}

function buildLastSevenDaysChart($baseDAO, $column) {
    $endDate = date("Y-m-d");
    $startDate = date("Y-m-d", strtotime($endDate . " -6 days"));

    $rowsByDate = getStatsRowsByDate($baseDAO, $startDate, $endDate, $column);

    $labels = [];
    $values = [];

    for ($i = 0; $i < 7; $i++) {
        $date = date("Y-m-d", strtotime($startDate . " +{$i} days"));

        $labels[] = date("D", strtotime($date));
        $values[] = getValueForDate($rowsByDate, $date, $column);
    }

    return [
        "labels" => $labels,
        "values" => $values
    ];
}

function buildLastFourWeeksChart($baseDAO, $column) {
    $endDate = date("Y-m-d");
    $startDate = date("Y-m-d", strtotime($endDate . " -27 days"));

    $rowsByDate = getStatsRowsByDate($baseDAO, $startDate, $endDate, $column);

    $labels = [];
    $values = [];

    for ($week = 0; $week < 4; $week++) {
        $weekTotal = 0;

        for ($day = 0; $day < 7; $day++) {
            $offset = ($week * 7) + $day;
            $date = date("Y-m-d", strtotime($startDate . " +{$offset} days"));

            $weekTotal += getValueForDate($rowsByDate, $date, $column);
        }

        $labels[] = "Week " . ($week + 1);
        $values[] = $weekTotal;
    }

    return [
        "labels" => $labels,
        "values" => $values
    ];
}

function buildCurrentYearChart($baseDAO, $column) {
    $year = date("Y");
    $startDate = "{$year}-01-01";
    $endDate = "{$year}-12-31";

    $rowsByDate = getStatsRowsByDate($baseDAO, $startDate, $endDate, $column);

    $labels = [];
    $values = [];

    for ($month = 1; $month <= 12; $month++) {
        $monthStart = date("Y-m-d", strtotime("{$year}-{$month}-01"));
        $daysInMonth = (int) date("t", strtotime($monthStart));
        $monthTotal = 0;

        for ($day = 0; $day < $daysInMonth; $day++) {
            $date = date("Y-m-d", strtotime($monthStart . " +{$day} days"));

            $monthTotal += getValueForDate($rowsByDate, $date, $column);
        }

        $labels[] = date("M", strtotime($monthStart));
        $values[] = $monthTotal;
    }

    return [
        "labels" => $labels,
        "values" => $values
    ];
}

function getStatsRowsByDate($baseDAO, $startDate, $endDate, $column) {
    $allowedColumns = [
        "new_users_count",
        "new_prompts_count"
    ];

    if (!in_array($column, $allowedColumns)) {
        throw new Exception("Invalid chart column");
    }

    $rows = $baseDAO->select(
        "SELECT stat_date, {$column}
         FROM dashboard_daily_stats
         WHERE stat_date BETWEEN :start_date AND :end_date
         ORDER BY stat_date ASC",
        [
            ":start_date" => $startDate,
            ":end_date" => $endDate
        ]
    );

    $rowsByDate = [];

    foreach ($rows as $row) {
        $rowsByDate[$row["stat_date"]] = $row;
    }

    return $rowsByDate;
}

function getValueForDate($rowsByDate, $date, $column) {
    if (isset($rowsByDate[$date])) {
        return (int) $rowsByDate[$date][$column];
    }

    return 0;
}

?>
