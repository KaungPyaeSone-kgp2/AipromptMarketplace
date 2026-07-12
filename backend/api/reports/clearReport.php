<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";

$data = json_decode(file_get_contents("php://input"), true);

$reportId = filter_var($data["report_id"] ?? null, FILTER_VALIDATE_INT);
$targetType = $data["target_type"] ?? null;
$isReceived = isset($data["is_received"]) ? filter_var($data["is_received"], FILTER_VALIDATE_BOOLEAN) : null;
$currentStatus = $data["current_status"] ?? null;

if (!$reportId || !$targetType || $isReceived === null || !$currentStatus) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$validTypes = ['prompt', 'user', 'comment'];
if (!in_array($targetType, $validTypes)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid target type"]);
    exit;
}

$table = "";
switch ($targetType) {
    case 'prompt': $table = "prompt_reports"; break;
    case 'user': $table = "user_reports"; break;
    case 'comment': $table = "bad_review_reports"; break;
}

$columnToUpdate = $isReceived ? "cleared_status_reported" : "cleared_status_reporter";

try {
    $db = new Database();
    $pdo = $db->connect();

    $stmt = $pdo->prepare("
        UPDATE {$table}
        SET {$columnToUpdate} = :current_status
        WHERE id = :report_id
    ");

    $stmt->execute([
        ':current_status' => $currentStatus,
        ':report_id' => $reportId
    ]);

    echo json_encode(["success" => true, "message" => "Report cleared successfully"]);

} catch (Exception $e) {
    error_log("clearReport error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to clear report"]);
}
?>
