<?php
require_once __DIR__ . "/backend/database/Database.php";
try {
    $db = new Database();
    $pdo = $db->connect();
    $stmt = $pdo->query("SELECT * FROM notifications");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
