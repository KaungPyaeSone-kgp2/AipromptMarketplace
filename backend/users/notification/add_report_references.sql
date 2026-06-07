-- Add reference_id and reference_type columns to notifications table
-- This allows polymorphic linking of a notification to a specific report (prompt, user, review)
-- so the UI can fetch live status and descriptions dynamically.

ALTER TABLE notifications 
ADD COLUMN reference_id BIGINT UNSIGNED NULL AFTER created_at,
ADD COLUMN reference_type VARCHAR(50) NULL AFTER reference_id;

-- Optional: Add an index for faster lookups when joining report tables
CREATE INDEX idx_notifications_reference ON notifications (reference_type, reference_id);
