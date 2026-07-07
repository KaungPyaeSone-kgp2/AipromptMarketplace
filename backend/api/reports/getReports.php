<?php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../../includes/cors_headers.php';
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

require_once __DIR__ . "/../../config/Database.php";

$userId = filter_input(INPUT_GET, "user_id", FILTER_VALIDATE_INT);

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    /*
    |--------------------------------------------------------------------------
    | 1. Fetch Submitted Reports (User is the reporter)
    |--------------------------------------------------------------------------
    */
    $submittedReports = [];

    // Prompt Reports
    $stmt = $pdo->prepare("
        SELECT pr.*, p.title as prompt_title, 'prompt' as target_type
        FROM prompt_reports pr
        LEFT JOIN prompts p ON pr.prompt_id = p.id
        WHERE pr.reporter_id = ?
    ");
    $stmt->execute([$userId]);
    $submittedReports = array_merge($submittedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // User Reports
    $stmt = $pdo->prepare("
        SELECT ur.*, u.user_name as reported_username, 'user' as target_type
        FROM user_reports ur
        LEFT JOIN users u ON ur.reported_user_id = u.id
        WHERE ur.reporter_id = ?
    ");
    $stmt->execute([$userId]);
    $submittedReports = array_merge($submittedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // Review Reports
    $stmt = $pdo->prepare("
        SELECT br.*, r.review_text as review_text, 'comment' as target_type
        FROM bad_review_reports br
        LEFT JOIN reviews r ON br.review_id = r.id
        WHERE br.reporter_id = ?
    ");
    $stmt->execute([$userId]);
    $submittedReports = array_merge($submittedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // Sort submitted by date
    usort($submittedReports, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });


    /*
    |--------------------------------------------------------------------------
    | 2. Fetch Received Reports (Reports against the user)
    |--------------------------------------------------------------------------
    */
    $receivedReports = [];

    // Prompt Reports (User is creator of the reported prompt)
    $stmt = $pdo->prepare("
        SELECT pr.*, p.title as prompt_title, 'prompt' as target_type
        FROM prompt_reports pr
        JOIN prompts p ON pr.prompt_id = p.id
        WHERE p.creator_id = ?
    ");
    $stmt->execute([$userId]);
    $receivedReports = array_merge($receivedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // User Reports (User is the one reported)
    $stmt = $pdo->prepare("
        SELECT ur.*, 'user' as target_type
        FROM user_reports ur
        WHERE ur.reported_user_id = ?
    ");
    $stmt->execute([$userId]);
    $receivedReports = array_merge($receivedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // Review Reports (User is the author of the reported review)
    $stmt = $pdo->prepare("
        SELECT br.*, r.review_text as review_text, 'comment' as target_type
        FROM bad_review_reports br
        JOIN reviews r ON br.review_id = r.id
        WHERE r.user_id = ?
    ");
    $stmt->execute([$userId]);
    $receivedReports = array_merge($receivedReports, $stmt->fetchAll(PDO::FETCH_ASSOC));

    // Sort received by date
    usort($receivedReports, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode([
        "success" => true,
        "submitted" => $submittedReports,
        "received" => $receivedReports
    ]);

} catch (Exception $e) {
    error_log("getReports error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to fetch reports"]);
}
?>
