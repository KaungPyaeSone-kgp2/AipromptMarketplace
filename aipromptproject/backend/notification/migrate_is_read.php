<?php
/**
 * One-time migration: Add is_read column to notifications table.
 * Run via: php backend/notification/migrate_is_read.php
 * Safe to run multiple times — checks if column already exists.
 */
require_once __DIR__ . "/../database/Database.php";

try {
    $db = new Database();
    $pdo = $db->connect();

    // Check if column already exists
    $cols = $pdo->query("SHOW COLUMNS FROM notifications LIKE 'is_read'")->fetchAll();
    if (count($cols) > 0) {
        echo "Column 'is_read' already exists. No changes made.\n";
        exit(0);
    }

    $pdo->exec("ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER message");
    echo "SUCCESS: Added 'is_read' column to notifications table.\n";

    // Add index for faster unread queries
    try {
        $pdo->exec("CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read)");
        echo "SUCCESS: Created index idx_notifications_user_unread.\n";
    } catch (Exception $e) {
        echo "Index may already exist: " . $e->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
