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

require_once __DIR__ . "/../../database/Database.php";

$isJson = isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false;

if ($isJson) {
    $data = json_decode(file_get_contents("php://input"), true);
} else {
    $data = $_POST;
}

$targetType  = $data["target_type"]  ?? "";
$targetId    = filter_var($data["target_id"]  ?? null, FILTER_VALIDATE_INT);
$reason      = $data["reason"]       ?? "";
$reporterId  = filter_var($data["reporter_id"] ?? null, FILTER_VALIDATE_INT);
$description = trim($data["description"] ?? "");

$imageEvidencePath = "";
if (isset($_FILES["image_evidence"]) && $_FILES["image_evidence"]["error"] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/../../../uploads/reports/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileName = time() . "_" . uniqid() . "_" . basename($_FILES["image_evidence"]["name"]);
    $targetFilePath = $uploadDir . $fileName;
    if (move_uploaded_file($_FILES["image_evidence"]["tmp_name"], $targetFilePath)) {
        $imageEvidencePath = "uploads/reports/" . $fileName;
    }
}

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/
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

try {
    $db  = new Database();
    $pdo = $db->connect();
    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Insert report into the correct table
    |--------------------------------------------------------------------------
    */
    $reportId = null;
    $reportType = "";

    switch ($targetType) {
        case "prompt":
            $stmt = $pdo->prepare(
                "INSERT INTO prompt_reports (reporter_id, prompt_id, reason, report_description, image_evidence)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = $pdo->lastInsertId();
            $reportType = "prompt_report";

            // Look up the prompt owner for notification
            $ownerStmt = $pdo->prepare("SELECT creator_id, title FROM prompts WHERE id = ?");
            $ownerStmt->execute([$targetId]);
            $prompt = $ownerStmt->fetch(PDO::FETCH_ASSOC);
            $notifyUserId = $prompt["creator_id"] ?? null;
            $notifyTitle  = "Prompt Reported";
            $notifyMsg    = "Your prompt \"" . ($prompt["title"] ?? "Unknown") . "\" has been reported for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;

        case "creator":
        case "user":
            $stmt = $pdo->prepare(
                "INSERT INTO user_reports (reporter_id, reported_user_id, reason, report_description, image_evidence)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = $pdo->lastInsertId();
            $reportType = "user_report";

            $notifyUserId = $targetId;
            $notifyTitle  = "Account Reported";
            $notifyMsg    = "Your account has been reported for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;

        case "comment":
            $stmt = $pdo->prepare(
                "INSERT INTO bad_review_reports (reporter_id, review_id, reason, report_description, image_evidence)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$reporterId, $targetId, $reason, $description ?: null, $imageEvidencePath]);
            $reportId = $pdo->lastInsertId();
            $reportType = "review_report";

            // Look up the review author for notification
            $reviewStmt = $pdo->prepare("SELECT user_id FROM reviews WHERE id = ?");
            $reviewStmt->execute([$targetId]);
            $review = $reviewStmt->fetch(PDO::FETCH_ASSOC);
            $notifyUserId = $review["user_id"] ?? null;
            $notifyTitle  = "Review Reported";
            $notifyMsg    = "Your review has been reported for: " . str_replace("_", " ", $reason) . ". Our team will review it shortly.";
            break;
    }

    /*
    |--------------------------------------------------------------------------
    | Create notification for the reported user
    |--------------------------------------------------------------------------
    */
    if (!empty($notifyUserId) && $notifyUserId !== $reporterId) {
        $pdo->prepare(
            "INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES (?, 'report reviewed', ?, ?, ?, ?)"
        )->execute([$notifyUserId, $notifyTitle, $notifyMsg, $reportId, $reportType]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create notification for the reporter
    |--------------------------------------------------------------------------
    */
    $targetTitleText = ucfirst($targetType === 'creator' ? 'user' : $targetType);
    $reporterTitle = "Report about " . $targetTitleText;
    $reporterMsg   = "Thank you for your report. Our team will review it shortly.";
    $pdo->prepare(
        "INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type) VALUES (?, 'report reviewed', ?, ?, ?, ?)"
    )->execute([$reporterId, $reporterTitle, $reporterMsg, $reportId, $reportType]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Report submitted successfully"
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Report submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to submit report. Please try again."]);
}
?>
