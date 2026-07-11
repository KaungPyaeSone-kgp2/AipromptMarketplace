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
require_once __DIR__ . "/../../dao/BaseDAO.php";
require_once __DIR__ . "/../../includes/socket_helper.php";

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);
    $promptId = filter_var($data["prompt_id"] ?? null, FILTER_VALIDATE_INT);
    $rating = filter_var($data["rating"] ?? null, FILTER_VALIDATE_INT);
    $reviewText = trim((string)($data["review_text"] ?? ""));

    if (!$userId || $userId <= 0 || !$promptId || $promptId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "A valid user_id and prompt_id are required"]);
        exit;
    }

    if (!$rating || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5"]);
        exit;
    }

    if ($reviewText === "") {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Review comment is required"]);
        exit;
    }

    $existingReviews = $dao->select(
        "SELECT id FROM reviews WHERE user_id = :user_id AND prompt_id = :prompt_id LIMIT 1",
        [":user_id" => $userId, ":prompt_id" => $promptId]
    );

    if (count($existingReviews) > 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You have already reviewed this prompt."]);
        exit;
    }

    $pdo->beginTransaction();

    $reviewId = $dao->insert(
        "INSERT INTO reviews (user_id, prompt_id, rating, review_text)
         VALUES (:user_id, :prompt_id, :rating, :review_text)",
        [":user_id" => $userId, ":prompt_id" => $promptId, ":rating" => $rating, ":review_text" => $reviewText]
    );

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

    // Sync prompt_stats for analytics chart
    $dao->insert(
        "INSERT INTO prompt_stats (prompt_id, stats_date, total_saves, total_reviews, average_rating)
         SELECT id, CURDATE(), COALESCE(save_count, 0), COALESCE(review_count, 0), COALESCE(average_rating, 0)
         FROM prompts WHERE id = :prompt_id
         ON DUPLICATE KEY UPDATE 
         total_saves = VALUES(total_saves), 
         total_reviews = VALUES(total_reviews), 
         average_rating = VALUES(average_rating)",
        [":prompt_id" => $promptId]
    );

    $pdo->commit();

    $cacheFile = __DIR__ . "/../../cache/home-data.json";
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }

    emitSocketEvent('prompt_updated', ['promptId' => $promptId]);

    echo json_encode(["success" => true, "message" => "Review added successfully", "review_id" => $reviewId]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
