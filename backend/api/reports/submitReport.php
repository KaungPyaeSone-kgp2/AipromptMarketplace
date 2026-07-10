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
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../includes/SupabaseStorage.php";

$isJson = isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false;
$data = $isJson ? json_decode(file_get_contents("php://input"), true) : $_POST;
if (!is_array($data)) {
    $data = [];
}

$targetType  = $data["target_type"]  ?? "";
$targetId    = filter_var($data["target_id"]  ?? null, FILTER_VALIDATE_INT);
$reason      = $data["reason"]       ?? "";
$reporterId  = filter_var($data["reporter_id"] ?? null, FILTER_VALIDATE_INT);
$description = trim($data["description"] ?? "");
$imageEvidencePath = "";

if (!$reporterId || $reporterId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid reporter_id is required"]);
    exit;
}

if (!$targetId || $targetId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid target_id is required"]);
    exit;
}

$allowedReasons = [
    "prompt"  => ["spam", "copyright", "nsfw", "fake", "other"],
    "creator" => ["spam", "scam", "harassment", "fake_account", "copyright", "abuse", "other"],
    "user"    => ["spam", "scam", "harassment", "fake_account", "copyright", "abuse", "other"],
    "comment" => ["spam", "fake_review", "harassment", "offensive_language", "irrelevant", "misleading", "duplicate", "other"],
];

if (!isset($allowedReasons[$targetType])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid target_type. Must be: prompt, creator, user, or comment"]);
    exit;
}

if (!in_array($reason, $allowedReasons[$targetType], true)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid reason '$reason' for target type '$targetType'. Allowed: " . implode(", ", $allowedReasons[$targetType])
    ]);
    exit;
}

$db  = new Database();
$pdo = $db->connect();

$reporterStmt = $pdo->prepare("SELECT user_name FROM users WHERE id = ? LIMIT 1");
$reporterStmt->execute([$reporterId]);
$reporterName = $reporterStmt->fetchColumn() ?: "unknown";
$safeName = preg_replace('/[^a-z0-9_]/', '_', strtolower($reporterName));
$safeName = preg_replace('/_+/', '_', trim($safeName, '_'));

if (isset($_FILES["image_evidence"]) && $_FILES["image_evidence"]["error"] === UPLOAD_ERR_OK) {
    switch ($targetType) {
        case "prompt":
            $subDir = "prompt_image_evidence";
            $descriptiveName = "{$safeName}_id{$reporterId}_promptreport_promptid{$targetId}";
            break;
        case "creator":
        case "user":
            $subDir = "user_account_image_evidence";
            $descriptiveName = "{$safeName}_id{$reporterId}_userreport_reporteduser{$targetId}";
            break;
        case "comment":
            $subDir = "review_image_evidence";
            $descriptiveName = "{$safeName}_id{$reporterId}_reviewreport_reviewid{$targetId}";
            break;
        default:
            $subDir = "other";
            $descriptiveName = "{$safeName}_id{$reporterId}_report_targetid{$targetId}";
            break;
    }

    $ext = strtolower(pathinfo($_FILES["image_evidence"]["name"], PATHINFO_EXTENSION));
    $fileName = time() . "_" . $descriptiveName . "." . $ext;
    
    $fileTmpPath = $_FILES["image_evidence"]["tmp_name"];
    $fileType = $_FILES["image_evidence"]["type"];
    $destPath = 'image_evidence_report/' . $subDir . '/' . $fileName;

    $supabase = new SupabaseStorage();
    $uploadedUrl = $supabase->upload($fileTmpPath, $destPath, $fileType);

    if ($uploadedUrl) {
        $imageEvidencePath = $uploadedUrl;
    }
}

function insertNotification(PDO $pdo, int $senderId, int $receiverId, string $title, string $message, int $referenceId, string $referenceType): void
{
    if (db_has_column($pdo, 'notifications', 'user_id')) {
        $stmt = $pdo->prepare(
            "INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES (?, 'report_reviewed', ?, ?, ?, ?)"
        );
        $stmt->execute([$receiverId, $title, $message, $referenceId, $referenceType]);
        return;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO notifications (sender_id, receiver_id, type, title, message, reference_id, reference_type) VALUES (?, ?, 'report_reviewed', ?, ?, ?, ?)"
    );
    $stmt->execute([$senderId, $receiverId, $title, $message, $referenceId, $referenceType]);
}

try {
    $pdo->beginTransaction();

    $reportId = null;
    $reportType = "";
    $notifyUserId = null;
    $notifyTitle = "";
    $notifyMsg = "";

    switch ($targetType) {
        case "prompt":
            $stmt = $pdo->prepare(
                "INSERT INTO prompt_reports (reporter_id, prompt_id, reason, report_description, image_evidence) VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = (int)$pdo->lastInsertId();
            $reportType = "prompt_report";

            $ownerStmt = $pdo->prepare("SELECT creator_id, title FROM prompts WHERE id = ?");
            $ownerStmt->execute([$targetId]);
            $prompt = $ownerStmt->fetch(PDO::FETCH_ASSOC);
            $notifyUserId = $prompt["creator_id"] ?? null;
            $notifyTitle = "Prompt Reported";
            $notifyMsg = "Your prompt \"" . ($prompt["title"] ?? "Unknown") . "\" has been reported by " . $reporterName . " for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;

        case "creator":
        case "user":
            $stmt = $pdo->prepare(
                "INSERT INTO user_reports (reporter_id, reported_user_id, reason, report_description, image_evidence) VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = (int)$pdo->lastInsertId();
            $reportType = "user_report";
            $notifyUserId = $targetId;
            $notifyTitle = "Account Reported";
            $notifyMsg = "Your account has been reported by " . $reporterName . " for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;

        case "comment":
            $stmt = $pdo->prepare(
                "INSERT INTO bad_review_reports (reporter_id, review_id, reason, report_description, image_evidence) VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = (int)$pdo->lastInsertId();
            $reportType = "review_report";

            $reviewStmt = $pdo->prepare("SELECT user_id FROM reviews WHERE id = ?");
            $reviewStmt->execute([$targetId]);
            $review = $reviewStmt->fetch(PDO::FETCH_ASSOC);
            $notifyUserId = $review["user_id"] ?? null;
            $notifyTitle = "Review Reported";
            $notifyMsg = "Your review has been reported by " . $reporterName . " for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;
    }

    require_once __DIR__ . '/../../includes/ensure_daily_stats.php';
    ensureTodayStatsRow($pdo);

    $sql = "UPDATE dashboard_daily_stats SET total_pending_reports = total_pending_reports + 1 WHERE stat_date = CURDATE()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    require_once __DIR__ . "/../../../websocket/socket_helper.php";

    if (!empty($notifyUserId) && (int)$notifyUserId !== $reporterId) {
        insertNotification($pdo, $reporterId, (int)$notifyUserId, $notifyTitle, $notifyMsg, $reportId, $reportType);
        emitSocketEvent('report_notification', [
            'title' => $notifyTitle,
            'message' => $notifyMsg
        ], "user_" . $notifyUserId);
    }

    $targetTitleText = ucfirst($targetType === 'creator' ? 'user' : $targetType);
    insertNotification(
        $pdo,
        $reporterId,
        $reporterId,
        "Report about " . $targetTitleText,
        "Thank you for your report. Our team will review it shortly.",
        $reportId,
        $reportType
    );
    
    emitSocketEvent('report_notification', [
        'title' => "Report about " . $targetTitleText,
        'message' => "Thank you for your report. Our team will review it shortly."
    ], "user_" . $reporterId);

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Report submitted successfully"]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Report submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to submit report. Please try again."]);
}
?>
