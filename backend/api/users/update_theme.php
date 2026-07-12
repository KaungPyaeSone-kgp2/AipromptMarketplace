<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

require_once __DIR__ . '/../../config/Database.php';

$data = json_decode(file_get_contents("php://input"), true);
$theme = $data['theme'] ?? 'light';

try {
    $db = new Database();
    $pdo = $db->connect();
    
    // Get theme_id for the given theme name
    $stmt = $pdo->prepare("SELECT id FROM themes WHERE theme_name = ?");
    $stmt->execute([$theme]);
    $themeRow = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$themeRow) {
        // Fallback to light if not found
        $stmt = $pdo->prepare("SELECT id FROM themes WHERE theme_name = 'light'");
        $stmt->execute();
        $themeRow = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if ($themeRow) {
        $themeId = $themeRow['id'];
        
        // Update user
        $updateStmt = $pdo->prepare("UPDATE users SET theme_id = ? WHERE id = ?");
        $updateStmt->execute([$themeId, $_SESSION['user_id']]);
        
        echo json_encode(["success" => true, "message" => "Theme updated"]);
    } else {
        echo json_encode(["success" => false, "message" => "Theme not found"]);
    }
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
