<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../database/Database.php";

$creatorId = filter_var($_GET["creator_id"] ?? null, FILTER_VALIDATE_INT);

if (!$creatorId || $creatorId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid creator_id is required"]);
    exit;
}

function getStatsForPeriod($pdo, $creatorId, $period) {
    if ($period === "week") {
        $dateCondition = "YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
        $purchasedDateCondition = "YEAR(pi.purchased_at) = YEAR(CURDATE()) AND MONTH(pi.purchased_at) = MONTH(CURDATE())";
        $dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        $purchasedDateFormat = "DATE_FORMAT(pi.purchased_at, '%Y-%m-%d')";
        $labelFormat = "DATE_FORMAT(created_at, '%a')";
        $purchasedLabelFormat = "DATE_FORMAT(pi.purchased_at, '%a')";
    } else if ($period === "month") {
        $dateCondition = "YEAR(created_at) = YEAR(CURDATE())";
        $purchasedDateCondition = "YEAR(pi.purchased_at) = YEAR(CURDATE())";
        $dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
        $purchasedDateFormat = "DATE_FORMAT(pi.purchased_at, '%Y-%m')";
        $labelFormat = "DATE_FORMAT(created_at, '%b')";
        $purchasedLabelFormat = "DATE_FORMAT(pi.purchased_at, '%b')";
    } else {
        $dateCondition = "created_at >= DATE_SUB(CURDATE(), INTERVAL 4 YEAR)";
        $purchasedDateCondition = "pi.purchased_at >= DATE_SUB(CURDATE(), INTERVAL 4 YEAR)";
        $dateFormat = "DATE_FORMAT(created_at, '%Y')";
        $purchasedDateFormat = "DATE_FORMAT(pi.purchased_at, '%Y')";
        $labelFormat = "DATE_FORMAT(created_at, '%Y')";
        $purchasedLabelFormat = "DATE_FORMAT(pi.purchased_at, '%Y')";
    }

    $incomeSql = "
        SELECT 
            $dateFormat AS data_key,
            $labelFormat AS data_label,
            SUM(net_coin) AS total_net
        FROM creator_earnings
        WHERE creator_id = ? AND $dateCondition
        GROUP BY data_key, data_label
        ORDER BY data_key ASC
    ";
    $incomeStmt = $pdo->prepare($incomeSql);
    $incomeStmt->execute([$creatorId]);
    $incomeRows = $incomeStmt->fetchAll(PDO::FETCH_ASSOC);

    $followerSql = "
        SELECT 
            $dateFormat AS data_key,
            $labelFormat AS data_label,
            COUNT(*) AS new_followers
        FROM followers
        WHERE creator_id = ? AND $dateCondition
        GROUP BY data_key, data_label
        ORDER BY data_key ASC
    ";
    $followerStmt = $pdo->prepare($followerSql);
    $followerStmt->execute([$creatorId]);
    $followerRows = $followerStmt->fetchAll(PDO::FETCH_ASSOC);

    $purchasedSql = "
        SELECT 
            $purchasedDateFormat AS data_key,
            $purchasedLabelFormat AS data_label,
            COUNT(*) AS total_sold
        FROM purchases_items pi
        JOIN prompts p ON pi.prompt_id = p.id
        WHERE p.creator_id = ? AND $purchasedDateCondition
        GROUP BY data_key, data_label
        ORDER BY data_key ASC
    ";
    $purchasedStmt = $pdo->prepare($purchasedSql);
    $purchasedStmt->execute([$creatorId]);
    $purchasedRows = $purchasedStmt->fetchAll(PDO::FETCH_ASSOC);

    $postedSql = "
        SELECT 
            $dateFormat AS data_key,
            $labelFormat AS data_label,
            COUNT(*) AS total_posted
        FROM prompts
        WHERE creator_id = ? AND $dateCondition
        GROUP BY data_key, data_label
        ORDER BY data_key ASC
    ";
    $postedStmt = $pdo->prepare($postedSql);
    $postedStmt->execute([$creatorId]);
    $postedRows = $postedStmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        "income" => $incomeRows,
        "followers" => $followerRows,
        "purchased" => $purchasedRows,
        "posted" => $postedRows,
    ];
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $totalIncomeStmt = $pdo->prepare("
    SELECT COALESCE(SUM(net_coin), 0) AS total_net_income
    FROM creator_earnings
    WHERE creator_id = ?
    ");
    $totalIncomeStmt->execute([$creatorId]);
    $totalIncome = $totalIncomeStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
    "success" => true,
    "data" => [
        "total_net_income" => (float) ($totalIncome["total_net_income"] ?? 0),
        "year" => getStatsForPeriod($pdo, $creatorId, "year"),
        "month" => getStatsForPeriod($pdo, $creatorId, "month"),
        "week" => getStatsForPeriod($pdo, $creatorId, "week")
    ]
]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
