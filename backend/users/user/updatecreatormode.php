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

require_once __DIR__ . "/../../database/Database.php";
require_once __DIR__ . "/../../dao/BaseDAO.php";

$payload = json_decode(file_get_contents("php://input"), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

$userId = filter_var($payload["user_id"] ?? null, FILTER_VALIDATE_INT);
$withdrawPassword = trim($payload["withdraw_password"] ?? "");

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

if (strlen($withdrawPassword) < 8) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Withdraw password must be at least 8 characters"]);
    exit;
}

if (!preg_match('/[A-Z]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 uppercase letter"]);
    exit;
}

if (!preg_match('/[0-9]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 number"]);
    exit;
}

if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $withdrawPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 special character"]);
    exit;
}

function normalizeProfileImagePath(?string $path): ?string
{
    if (!$path) {
        return null;
    }

    $path = str_replace("\\", "/", $path);
    $path = ltrim($path, "/");
    $path = preg_replace("#^backend/users/#", "", $path);
    $path = preg_replace("#^users/uploads/#", "uploads/", $path);

    return $path;
}

function moveUserProfileImageToCreatorFolder(int $userId, ?string $path): ?string
{
    $path = normalizeProfileImagePath($path);

    if (!$path || !str_starts_with($path, "uploads/users/profile/")) {
        return $path;
    }

    $uploadsRoot = realpath(__DIR__ . "/../uploads");
    $oldImagePath = realpath(__DIR__ . "/../" . $path);

    if (!$uploadsRoot || !$oldImagePath || !str_starts_with($oldImagePath, $uploadsRoot) || !is_file($oldImagePath)) {
        return $path;
    }

    $extension = pathinfo($oldImagePath, PATHINFO_EXTENSION);
    $extension = $extension ? "." . $extension : "";
    $creatorUploadDir = __DIR__ . "/../uploads/creators/profile";

    if (!is_dir($creatorUploadDir)) {
        mkdir($creatorUploadDir, 0777, true);
    }

    $newFileName = "creator_" . $userId . "_" . time() . $extension;
    $newRelativePath = "uploads/creators/profile/" . $newFileName;
    $newImagePath = $creatorUploadDir . "/" . $newFileName;

    if (!rename($oldImagePath, $newImagePath)) {
        return $path;
    }

    return $newRelativePath;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    // Auto-migrate: add withdraw_password column if it doesn't exist
    $columns = $pdo->query("SHOW COLUMNS FROM users LIKE 'withdraw_password'")->fetchAll();
    if (count($columns) === 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN withdraw_password VARCHAR(255) NULL AFTER creator_mode");
    }

    $users = $dao->select(
        "SELECT id, profile_image
         FROM users
         WHERE id = :user_id
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($users) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $profileImagePath = moveUserProfileImageToCreatorFolder(
        $userId,
        $users[0]["profile_image"] ?? null
    );

    $hashedPassword = password_hash($withdrawPassword, PASSWORD_DEFAULT);

    $dao->update(
        "UPDATE users
         SET creator_mode = TRUE,
             profile_image = :profile_image,
             withdraw_password = :withdraw_password
         WHERE id = :user_id",
        [
            ":profile_image" => $profileImagePath,
            ":withdraw_password" => $hashedPassword,
            ":user_id" => $userId,
        ]
    );

    $dao->insert(
        "INSERT INTO creator_data (user_id)
         VALUES (:user_id)
         ON DUPLICATE KEY UPDATE updated_at = updated_at",
        [":user_id" => $userId]
    );

    echo json_encode([
        "success" => true,
        "message" => "You become the creator.",
        "creator_mode" => true,
        "data" => [
            "id" => $userId,
            "creator_mode" => true,
            "profile_image" => $profileImagePath,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
