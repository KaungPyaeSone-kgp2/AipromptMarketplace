<?php
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);
if (!$userId) {
    echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    exit();
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $recipientColumn = db_has_column($pdo, 'notifications', 'user_id') ? 'user_id' : 'receiver_id';

    $query = "
        SELECT
            n.id,
            n.`{$recipientColumn}` AS user_id,
            n.type,
            n.title,
            n.message,
            n.is_read,
            n.created_at,
            n.reference_id,
            n.reference_type,
            COALESCE(pr.status, ur.status, br.status) AS report_status,
            COALESCE(pr.report_description, ur.report_description, br.report_description) AS report_description
        FROM notifications n
        LEFT JOIN prompt_reports pr ON n.reference_type = 'prompt_report' AND n.reference_id = pr.id
        LEFT JOIN user_reports ur ON n.reference_type = 'user_report' AND n.reference_id = ur.id
        LEFT JOIN bad_review_reports br ON n.reference_type = 'review_report' AND n.reference_id = br.id
        WHERE n.`{$recipientColumn}` = ?
        ORDER BY n.created_at DESC
        LIMIT 20
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $notifications]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
