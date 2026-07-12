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

$reviewId = filter_var($data["review_id"] ?? null, FILTER_VALIDATE_INT);
$creatorId = filter_var($data["creator_id"] ?? null, FILTER_VALIDATE_INT);
$userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);

if (!$reviewId || (!$creatorId && !$userId)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing review_id, or neither creator_id nor user_id provided"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();

    $column = $creatorId ? "cleared_by_creator" : "cleared_by_reviewer";

    $stmt = $pdo->prepare("
        UPDATE reviews
        SET {$column} = 1
        WHERE id = :review_id
    ");

    $stmt->execute([
        ':review_id' => $reviewId
    ]);

    echo json_encode(["success" => true, "message" => "Review cleared successfully"]);

} catch (Exception $e) {
    error_log("clearReview error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to clear review"]);
}
?>
