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

    $existing = $dao->select(
        "SELECT id FROM wishlists WHERE user_id = :user_id AND prompt_id = :prompt_id LIMIT 1",
        [":user_id" => $userId, ":prompt_id" => $promptId]
    );

    if (count($existing) === 0) {
        $pdo->beginTransaction();

        $dao->insert(
            "INSERT INTO wishlists (user_id, prompt_id) VALUES (:user_id, :prompt_id)",
            [":user_id" => $userId, ":prompt_id" => $promptId]
        );

        if (db_has_column($pdo, 'prompts', 'save_count')) {
            $dao->update(
                "UPDATE prompts
                 SET save_count = (SELECT COUNT(*) FROM wishlists WHERE prompt_id = :count_prompt_id)
                 WHERE id = :update_prompt_id",
                [":count_prompt_id" => $promptId, ":update_prompt_id" => $promptId]
            );
        }

        $pdo->commit();
    }

    echo json_encode(["success" => true, "message" => "Added to wishlist successfully"]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
