<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if (!in_array($_SERVER["REQUEST_METHOD"], ["POST", "DELETE"], true)) {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Only POST or DELETE method is allowed"]);
    exit;
}

require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../database/schema_helpers.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";
require_once __DIR__ . "/../../../websocket/socket_helper.php";

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $data = json_decode(file_get_contents("php://input"), true);
    $reviewId = filter_var($data["review_id"] ?? null, FILTER_VALIDATE_INT);
    $userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);

    if (!$reviewId || $reviewId <= 0 || !$userId || $userId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "A valid review_id and user_id are required"]);
        exit;
    }

    $reviews = $dao->select(
        "SELECT id, prompt_id, user_id FROM reviews WHERE id = :review_id LIMIT 1",
        [":review_id" => $reviewId]
    );

    if (count($reviews) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Review not found"]);
        exit;
    }

    $review = $reviews[0];
    if ((int)$review["user_id"] !== $userId) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "You can only delete your own review"]);
        exit;
    }

    $pdo->beginTransaction();

    $deletedCount = $dao->delete(
        "DELETE FROM reviews WHERE id = :review_id AND user_id = :user_id",
        [":review_id" => $reviewId, ":user_id" => $userId]
    );

    $promptId = (int)$review["prompt_id"];
    $reviewCount = null;
    $averageRating = null;

    if ($deletedCount > 0) {
        if (db_has_column($pdo, 'prompts', 'review_count')) {
            $dao->update(
                "UPDATE prompts
                 SET review_count = (SELECT COUNT(*) FROM reviews WHERE prompt_id = :review_count_prompt_id AND (is_banned IS NULL OR is_banned = 0)),
                     average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE prompt_id = :average_rating_prompt_id AND (is_banned IS NULL OR is_banned = 0))
                 WHERE id = :update_prompt_id",
                [":review_count_prompt_id" => $promptId, ":average_rating_prompt_id" => $promptId, ":update_prompt_id" => $promptId]
            );
        } else {
            $dao->update(
                "UPDATE prompts
                 SET average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE prompt_id = :average_rating_prompt_id AND (is_banned IS NULL OR is_banned = 0))
                 WHERE id = :update_prompt_id",
                [":average_rating_prompt_id" => $promptId, ":update_prompt_id" => $promptId]
            );
        }

        $summary = $dao->select(
            "SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating FROM reviews WHERE prompt_id = :prompt_id AND (is_banned IS NULL OR is_banned = 0)",
            [":prompt_id" => $promptId]
        );

        $reviewCount = (int)($summary[0]["review_count"] ?? 0);
        $averageRating = (float)($summary[0]["average_rating"] ?? 0);
        
        emitSocketEvent('prompt_updated', ['promptId' => $promptId]);
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Review deleted successfully",
        "deleted_count" => $deletedCount,
        "review_count" => $reviewCount,
        "average_rating" => $averageRating,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
