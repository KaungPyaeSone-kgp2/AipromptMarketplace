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

$userId = filter_var($_POST["user_id"] ?? null, FILTER_VALIDATE_INT);
$userName = trim($_POST["user_name"] ?? "");
$userEmail = trim($_POST["user_email"] ?? "");
$bio = trim($_POST["bio"] ?? "");

if (!$userId || $userId <= 0 || $userName === "" || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "A valid user_id, name, and email are required"]);
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

function deleteOldProfileImage(?string $path): void
{
    $path = normalizeProfileImagePath($path);

    if (!$path) {
        return;
    }

    $allowedFolders = [
        "uploads/users/profile/",
        "uploads/creators/profile/",
    ];

    $isProfileImage = false;
    foreach ($allowedFolders as $folder) {
        if (str_starts_with($path, $folder)) {
            $isProfileImage = true;
            break;
        }
    }

    if (!$isProfileImage) {
        return;
    }

    $uploadsRoot = realpath(__DIR__ . "/../uploads");
    $oldImagePath = realpath(__DIR__ . "/../" . $path);

    if (!$uploadsRoot || !$oldImagePath || !str_starts_with($oldImagePath, $uploadsRoot)) {
        return;
    }

    if (is_file($oldImagePath)) {
        unlink($oldImagePath);
    }
}

try {
    $db = new Database();
    $pdo = $db->connect();
    $dao = new BaseDAO($pdo);

    $existingUsers = $dao->select(
        "SELECT creator_mode, profile_image
         FROM users
         WHERE id = :user_id
         LIMIT 1",
        [":user_id" => $userId]
    );

    if (count($existingUsers) === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $existingUser = $existingUsers[0];
    $isCreator = (int) $existingUser["creator_mode"] === 1;
    $oldProfileImagePath = $existingUser["profile_image"] ?? null;
    $profileImagePath = $_POST["profile_image"] ?? null;

    if (isset($_FILES["profile_image"]) && $_FILES["profile_image"]["error"] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES["profile_image"]["error"] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Profile image upload failed"]);
            exit;
        }

        $allowedMimeTypes = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/gif" => "gif",
            "image/webp" => "webp",
        ];
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

        $uploadFolder = $isCreator ? "creators" : "users";
        $filePrefix = $isCreator ? "creator" : "user";
        $uploadDir = __DIR__ . "/../uploads/" . $uploadFolder . "/profile";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = $allowedMimeTypes[$mimeType];
        $fileName = $filePrefix . "_" . $userId . "_" . time() . "." . $extension;
        $targetPath = $uploadDir . "/" . $fileName;

        if (!move_uploaded_file($_FILES["profile_image"]["tmp_name"], $targetPath)) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Unable to save profile image"]);
            exit;
        }

        $profileImagePath = "uploads/" . $uploadFolder . "/profile/" . $fileName;
    }

    $fields = [
        "user_name = :user_name",
        "user_email = :user_email",
        "user_bio = :user_bio",
    ];
    $params = [
        ":user_name" => $userName,
        ":user_email" => $userEmail,
        ":user_bio" => $bio,
        ":user_id" => $userId,
    ];

    if ($profileImagePath) {
        $fields[] = "profile_image = :profile_image";
        $params[":profile_image"] = $profileImagePath;
    }

    $dao->update(
        "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :user_id",
        $params
    );

    if ($profileImagePath) {
        deleteOldProfileImage($oldProfileImagePath);
    }

    $updatedUsers = $dao->select(
        "SELECT
            id,
            user_name,
            user_email,
            user_role,
            creator_mode,
            coin_balance,
            following_count,
            purchased_prompts_count,
            profile_image,
            user_bio,
            created_at,
            updated_at
         FROM users
         WHERE id = :user_id
         LIMIT 1",
        [":user_id" => $userId]
    );

    $updatedUser = $updatedUsers[0] ?? [
        "id" => $userId,
        "user_name" => $userName,
        "user_email" => $userEmail,
        "user_bio" => $bio,
        "profile_image" => $profileImagePath,
    ];
    if (array_key_exists("creator_mode", $updatedUser)) {
        $updatedUser["creator_mode"] = (bool) $updatedUser["creator_mode"];
    }

    echo json_encode([
        "success" => true,
        "message" => "Profile changes saved successfully.",
        "data" => $updatedUser,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
