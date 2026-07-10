<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";

try {
    $db = new Database();
    $pdo = $db->connect();

    $allReports = [];

    // 1. Fetch Prompt Reports with raw SQL JOINs
    $promptSql = "
        SELECT 
            pr.id, pr.reason, pr.report_description as description, pr.image_evidence, pr.created_at, pr.reporter_id,
            'prompt' as target_type, pr.prompt_id as target_id,
            p.title as asset_name, 
            u.user_name as reporter_name 
        FROM prompt_reports pr 
        LEFT JOIN prompts p ON pr.prompt_id = p.id 
        LEFT JOIN users u ON pr.reporter_id = u.id 
        WHERE pr.status = 'pending'
    ";
    $promptStmt = $pdo->query($promptSql);
    $allReports = array_merge($allReports, $promptStmt->fetchAll(PDO::FETCH_ASSOC));

    // 2. Fetch User/Creator Reports with raw SQL JOINs
    $userSql = "
        SELECT 
            ur.id, ur.reason, ur.report_description as description, ur.image_evidence, ur.created_at, ur.reporter_id,
            'user' as target_type, ur.reported_user_id as target_id,
            u2.user_name as asset_name, 
            u.user_name as reporter_name 
        FROM user_reports ur 
        LEFT JOIN users u2 ON ur.reported_user_id = u2.id 
        LEFT JOIN users u ON ur.reporter_id = u.id 
        WHERE ur.status = 'pending'
    ";
    $userStmt = $pdo->query($userSql);
    $allReports = array_merge($allReports, $userStmt->fetchAll(PDO::FETCH_ASSOC));

    // 3. Fetch Comment/Review Reports with raw SQL JOINs
    $reviewSql = "
        SELECT 
            br.id, br.reason, br.report_description as description, br.image_evidence, br.created_at, br.reporter_id,
            'comment' as target_type, br.review_id as target_id,
            r.review_text as asset_name, 
            u.user_name as reporter_name 
        FROM bad_review_reports br 
        LEFT JOIN reviews r ON br.review_id = r.id 
        LEFT JOIN users u ON br.reporter_id = u.id 
        WHERE br.status = 'pending'
    ";
    $reviewStmt = $pdo->query($reviewSql);
    $allReports = array_merge($allReports, $reviewStmt->fetchAll(PDO::FETCH_ASSOC));

    // 4. Sort everything chronologically (newest first)
    usort($allReports, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode(["success" => true, "reports" => $allReports]);

} catch (Exception $e) {
    error_log("Admin Fetch Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to fetch admin reports."]);
}
?>