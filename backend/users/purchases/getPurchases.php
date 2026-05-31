<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only GET method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);
$period = $_GET["period"] ?? "this_month";
$filterType = $_GET["filter_type"] ?? "period";
$singleDate = $_GET["date"] ?? null;
$startDate = $_GET["start_date"] ?? null;
$endDate = $_GET["end_date"] ?? null;
$month = $_GET["month"] ?? null;

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

$periodFilters = [
    "today" => "DATE(pur.purchased_at) = CURDATE()",
    "this_week" => "YEARWEEK(pur.purchased_at, 1) = YEARWEEK(CURDATE(), 1)",
    "last_week" => "YEARWEEK(pur.purchased_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)",
    "this_month" => "YEAR(pur.purchased_at) = YEAR(CURDATE()) AND MONTH(pur.purchased_at) = MONTH(CURDATE())",
    "last_month" => "pur.purchased_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND pur.purchased_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
];

if (!array_key_exists($period, $periodFilters)) {
    $period = "this_month";
}

function isValidDateValue($value, $format)
{
    if (!$value) {
        return false;
    }

    $date = DateTime::createFromFormat($format, $value);
    return $date && $date->format($format) === $value;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $where = ["pur.buyer_id = :user_id"];
    $params = [":user_id" => $userId];

    if ($filterType === "single_date" && isValidDateValue($singleDate, "Y-m-d")) {
        $where[] = "DATE(pur.purchased_at) = :single_date";
        $params[":single_date"] = $singleDate;
    } elseif (
        $filterType === "range"
        && isValidDateValue($startDate, "Y-m-d")
        && isValidDateValue($endDate, "Y-m-d")
    ) {
        if ($startDate > $endDate) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "start_date cannot be after end_date"]);
            exit;
        }

        $where[] = "DATE(pur.purchased_at) BETWEEN :start_date AND :end_date";
        $params[":start_date"] = $startDate;
        $params[":end_date"] = $endDate;
    } elseif ($filterType === "month" && isValidDateValue($month, "Y-m")) {
        $where[] = "DATE_FORMAT(pur.purchased_at, '%Y-%m') = :month";
        $params[":month"] = $month;
    } else {
        $filterType = "period";
        $where[] = $periodFilters[$period];
    }

    $whereSql = implode(" AND ", $where);

    $purchases = $dao->select(
        "SELECT
            pur.id AS purchase_id,
            pur.buyer_id,
            pur.total_coin_paid,
            pur.purchased_at,
            COUNT(pi.id) AS item_count
         FROM purchases pur
         LEFT JOIN purchases_items pi ON pi.purchase_id = pur.id
         WHERE {$whereSql}
         GROUP BY pur.id, pur.buyer_id, pur.total_coin_paid, pur.purchased_at
         ORDER BY pur.purchased_at DESC, pur.id DESC",
        $params
    );

    echo json_encode([
        "success" => true,
        "filter_type" => $filterType,
        "period" => $period,
        "count" => count($purchases),
        "data" => $purchases,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
