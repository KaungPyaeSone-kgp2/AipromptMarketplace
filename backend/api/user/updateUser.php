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

session_start();
$userId = filter_var($_POST['user_id'] ?? $_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
$bio = trim($_POST["bio"] ?? "");

if (!$userId || $userId <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id is required"]);
    exit;
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $existingUsers = $dao->select(
        "SELECT profile_image FROM users WHERE id = :user_id LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($existingUsers) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $profileImagePath = $_POST["profile_image"] ?? null;

    if (isset($_FILES["profile_image"]) && $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES["profile_image"]["error"] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Profile image upload failed"]);
            exit;
        }

        $allowedMimeTypes = ["image/jpeg" => "jpg", "image/png" => "png", "image/gif" => "gif", "image/webp" => "webp"];
        $mimeType = mime_content_type($_FILES["profile_image"]["tmp_name"]);

        if (!isset($allowedMimeTypes[$mimeType])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Only JPG, PNG, GIF, or WEBP images are allowed"]);
            exit;
        }

        if ($_FILES["profile_image"]["size"] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Profile image must be 5MB or less"]);
            exit;
        }

        $uploadDir = __DIR__ . "/../../uploads/users/profile";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = $allowedMimeTypes[$mimeType];
        $fileName = "user_" . $userId . "_" . time() . "." . $extension;
        $targetPath = $uploadDir . "/" . $fileName;

        if (!move_uploaded_file($_FILES["profile_image"]["tmp_name"], $targetPath)) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Unable to save profile image"]);
            exit;
        }

        $profileImagePath = "uploads/users/profile/" . $fileName;
    }

    $fields = [];
    $params = [":user_id" => $userId];

    if (db_has_column($pdo, 'users', 'user_bio')) {
        $fields[] = "user_bio = :user_bio";
        $params[":user_bio"] = $bio;
    }

    if ($profileImagePath) {
        $fields[] = "profile_image = :profile_image";
        $params[":profile_image"] = $profileImagePath;
    }

    if (count($fields) > 0) {
        $dao->update("UPDATE users SET " . implode(", ", $fields) . " WHERE id = :user_id", $params);
    }

    $bioExpr = db_column_expr($pdo, 'users', 'user_bio', 'user_bio', "''");

    $updatedUsers = $dao->select(
        "SELECT u.id, u.user_name, u.user_email, u.user_role,
                (cd.id IS NOT NULL) AS is_creator,
                (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) AS following_count,
                u.profile_image, {$bioExpr} AS user_bio, u.created_at, u.updated_at
         FROM users u
         LEFT JOIN creator_data cd ON cd.user_id = u.id
         WHERE u.id = :user_id LIMIT 1",
        [":user_id" => $userId]
    );

    $updatedUser = $updatedUsers[0] ?? [];
    if (array_key_exists("is_creator", $updatedUser)) {
        $updatedUser["is_creator"] = (bool)$updatedUser["is_creator"];
    }

    echo json_encode(["success" => true, "message" => "Profile changes saved successfully.", "data" => $updatedUser]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
