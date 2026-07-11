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
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed",
    ]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

try {
    $db = new Database();
    $pdo = $db->connect();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed",
    ]);
    exit;
}

$dao = new BaseDAO($pdo);

try {
    $data = json_decode(file_get_contents("php://input"), true);

    $followerId = filter_var($data["follower_id"] ?? null, FILTER_VALIDATE_INT);
    $creatorId = filter_var($data["creator_id"] ?? null, FILTER_VALIDATE_INT);

    if (!$followerId || $followerId <= 0 || !$creatorId || $creatorId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "A valid follower_id and creator_id are required",
        ]);
        exit;
    }

    if ($followerId === $creatorId) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "A user cannot follow themselves",
        ]);
        exit;
    }

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

    $isFollowing = count($existing) === 0;

    if ($isFollowing) {
        $dao->insert(
            "INSERT INTO followers (follower_id, creator_id)
             VALUES (:follower_id, :creator_id)",
            [
                ":follower_id" => $followerId,
                ":creator_id" => $creatorId,
            ]
        );
    } else {
        $dao->delete(
            "DELETE FROM followers
             WHERE follower_id = :follower_id
             AND creator_id = :creator_id",
            [
                ":follower_id" => $followerId,
                ":creator_id" => $creatorId,
            ]
        );
    }

    $followersCount = $dao->select(
        "SELECT COUNT(*) AS followers_count
         FROM followers
         WHERE creator_id = :creator_id",
        [":creator_id" => $creatorId]
    );

    $followingCount = $dao->select(
        "SELECT COUNT(*) AS following_count
         FROM followers
         WHERE follower_id = :follower_id",
        [":follower_id" => $followerId]
    );

    $creatorFollowersCount = (int)($followersCount[0]["followers_count"] ?? 0);
    $buyerFollowingCount = (int)($followingCount[0]["following_count"] ?? 0);

    require_once __DIR__ . "/../../includes/socket_helper.php";
    emitSocketEvent('follow_updated', [
        'followers_count' => $creatorFollowersCount,
        'follower_id' => $followerId
    ], "user_" . $creatorId);

    echo json_encode([
        "success" => true,
        "is_following" => $isFollowing,
        "followers_count" => $creatorFollowersCount,
        "following_count" => $buyerFollowingCount,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
