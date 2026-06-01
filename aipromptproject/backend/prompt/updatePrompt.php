<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../database/Database.php";
require_once __DIR__ . "/../dao/BaseDAO.php";

$prompt_id = filter_input(INPUT_POST, "prompt_id", FILTER_VALIDATE_INT);
$creator_id = filter_input(INPUT_POST, "creator_id", FILTER_VALIDATE_INT);
$sale_coin = filter_input(INPUT_POST, "sale_coin", FILTER_VALIDATE_INT);
$prompt_variables = $_POST["prompt_variables"] ?? "[]";

if (!$prompt_id || !$creator_id || $sale_coin === false || $sale_coin < 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "prompt_id, creator_id, and a valid sale_coin are required",
    ]);
    exit;
}

json_decode($prompt_variables, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "prompt_variables must be valid JSON",
    ]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $prompt = $dao->select(
        "SELECT id FROM prompts WHERE id = :prompt_id AND creator_id = :creator_id LIMIT 1",
        [
            ":prompt_id" => $prompt_id,
            ":creator_id" => $creator_id,
        ]
    );

    if (count($prompt) === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Prompt not found or you are not allowed to edit it",
        ]);
        exit;
    }

    $dao->update(
        "UPDATE prompts
         SET prompt_variables = :prompt_variables,
             sale_coin = :sale_coin,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :prompt_id
           AND creator_id = :creator_id",
        [
            ":prompt_variables" => $prompt_variables,
            ":sale_coin" => $sale_coin,
            ":prompt_id" => $prompt_id,
            ":creator_id" => $creator_id,
        ]
    );

    echo json_encode([
        "success" => true,
        "message" => "Prompt updated successfully",
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage(),
    ]);
}
?>