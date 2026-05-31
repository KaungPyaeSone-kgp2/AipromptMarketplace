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

require_once __DIR__ . "/../../database/Database.php";
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

    $userId = filter_var($data["user_id"] ?? null, FILTER_VALIDATE_INT);
    $promptId = filter_var($data["prompt_id"] ?? null, FILTER_VALIDATE_INT);
    $rating = filter_var($data["rating"] ?? null, FILTER_VALIDATE_INT);
    $reviewText = trim((string)($data["review_text"] ?? ""));

    if (!$userId || $userId <= 0 || !$promptId || $promptId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "A valid user_id and prompt_id are required",
        ]);
        exit;
    }

    if (!$rating || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Rating must be between 1 and 5",
        ]);
        exit;
    }

    if ($reviewText === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Review comment is required",
        ]);
        exit;
    }

    $reviewId = $dao->insert(
        "INSERT INTO reviews (user_id, prompt_id, rating, review_text)
         VALUES (:user_id, :prompt_id, :rating, :review_text)",
        [
            ":user_id" => $userId,
            ":prompt_id" => $promptId,
            ":rating" => $rating,
            ":review_text" => $reviewText,
        ]
    );

    $dao->update(
        "UPDATE prompts
         SET
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE prompt_id = :review_count_prompt_id
            ),
            average_rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE prompt_id = :average_rating_prompt_id
            )
         WHERE id = :update_prompt_id",
        [
            ":review_count_prompt_id" => $promptId,
            ":average_rating_prompt_id" => $promptId,
            ":update_prompt_id" => $promptId,
        ]
    );

    echo json_encode([
        "success" => true,
        "message" => "Review added successfully",
        "review_id" => $reviewId,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
