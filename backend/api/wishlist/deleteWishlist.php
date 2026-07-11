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

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $data = json_decode(file_get_contents("php://input"), true);
    $userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);
    $promptId = filter_var($data["prompt_id"] ?? null, FILTER_VALIDATE_INT);

    if (!$userId || $userId <= 0 || !$promptId || $promptId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "A valid user_id and prompt_id are required"]);
        exit;
    }

    $pdo->beginTransaction();

    $deletedCount = $dao->delete(
        "DELETE FROM wishlists WHERE user_id = :user_id AND prompt_id = :prompt_id",
        [":user_id" => $userId, ":prompt_id" => $promptId]
    );

    if ($deletedCount > 0 && db_has_column($pdo, 'prompts', 'save_count')) {
        $dao->update(
            "UPDATE prompts
             SET save_count = (SELECT COUNT(*) FROM wishlists WHERE prompt_id = :count_prompt_id)
             WHERE id = :update_prompt_id",
            [":count_prompt_id" => $promptId, ":update_prompt_id" => $promptId]
        );

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
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Removed from wishlist successfully",
        "deleted_count" => $deletedCount,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
