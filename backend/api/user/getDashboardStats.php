<?php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../../includes/cors_headers.php';
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";

$requestData = json_decode(file_get_contents("php://input"), true);
$creatorId = isset($requestData["creator_id"]) ? filter_var($requestData["creator_id"], FILTER_VALIDATE_INT) : null;

if (!$creatorId || $creatorId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid creator_id is required"]);
    exit;
}

function getStatsForPeriod($pdo, $creatorId, $period) {
    if ($period === "week") {
        $dateCondition = "YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
        $dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        $labelFormat = "DATE_FORMAT(created_at, '%a')";
    } else if ($period === "month") {
        $dateCondition = "YEAR(created_at) = YEAR(CURDATE())";
        $dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
        $labelFormat = "DATE_FORMAT(created_at, '%b')";
    } else {
        $dateCondition = "created_at >= DATE_SUB(CURDATE(), INTERVAL 4 YEAR)";
        $dateFormat = "DATE_FORMAT(created_at, '%Y')";
        $labelFormat = "DATE_FORMAT(created_at, '%Y')";
    }

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
        "followers" => $followerRows,
        "posted" => $postedRows,
    ];
}

try {
    $db = new Database();
    $pdo = $db->connect();

    echo json_encode([
    "success" => true,
    "data" => [
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
