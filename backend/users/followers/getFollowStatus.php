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
require_once __DIR__ . "/../../dao/BaseDAO.php";

$followerId = filter_input(INPUT_GET, "follower_id", FILTER_VALIDATE_INT);
$creatorId = filter_input(INPUT_GET, "creator_id", FILTER_VALIDATE_INT);

if (!$followerId || $followerId <= 0 || !$creatorId || $creatorId <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "A valid follower_id and creator_id are required",
    ]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $existing = $dao->select(
        "SELECT follower_id
         FROM followers
         WHERE follower_id = :follower_id
         AND creator_id = :creator_id
         LIMIT 1",
        [
            ":follower_id" => $followerId,
            ":creator_id" => $creatorId,
        ]
    );

    echo json_encode([
        "success" => true,
        "is_following" => count($existing) > 0,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
