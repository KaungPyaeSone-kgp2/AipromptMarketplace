-- Add is_read column to notifications table
-- Run this once: mysql -u root -p your_database < add_is_read_column.sql
-- Or execute in phpMyAdmin / MySQL Workbench

ALTER TABLE notifications
ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER message;

-- Optional: add index for faster unread queries
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);
