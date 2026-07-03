# Notification Feature

## Detailed Overview
The notification system is deeply integrated into the application's layout, providing real-time alerts for users when they receive reports, new purchases, or administrative updates.

## Connected Files

### Frontend
- **`frontend/src/users/layouts/UserLayout.jsx`**: Manages the `notificationCount` state at the root level.
  - **Polling**: Uses a `setInterval` to fetch the unread count every 30 seconds via `refreshNotificationCount()`.
  - **Event Listeners**: Listens for custom events like `promptai:force-notification-update` (dispatched by the report modal) and `promptai:purchase-success` to instantly trigger a refresh of the notification count without waiting for the next polling interval.
- **`frontend/src/users/components/layout/Navbar.jsx`**: Receives `notificationCount` as a prop and displays a badge over the notification bell icon. Likely contains a dropdown or links to a dedicated notifications page.
- **`frontend/src/users/components/Toast.jsx`**: Used to show transient, in-app notifications (e.g., successful actions or errors).

### Backend
- **`backend/users/notification/getNotifications.php`**: Fetches the detailed list of notifications for the currently authenticated user.
- **`backend/users/notification/getUnreadCount.php`**: A lightweight endpoint that simply returns `COUNT(*)` of unread notifications for the user, optimized for frequent polling.
- **`backend/users/notification/markRead.php`**: Updates the `is_read` column to `1` and sets the `read_at` timestamp. Can mark a specific notification by ID or clear all unread notifications.
- **Database Schema**: The `notifications` table includes columns for `user_id`/`receiver_id`, `message`, `is_read`, `read_at`, `reference_id`, and `reference_type` (for polymorphic linking to reports, prompts, etc.).

## Step-by-Step Workflow
1. **Event Creation**: A backend script (e.g., `submitReport.php` or purchase logic) inserts a row into the `notifications` table.
2. **Polling / Instant Update**: `UserLayout.jsx` either hits its 30-second polling interval or is triggered by a custom event, fetching the new count from `getUnreadCount.php`.
3. **UI Update**: The state updates, propagating the new count to `Navbar.jsx`, which shows a red badge.
4. **User Interaction**: The user clicks the notification bell, triggering a fetch to `getNotifications.php` to load the actual messages.
5. **Mark as Read**: Clicking a specific notification calls `markRead.php`, turning off the unread badge and updating the database.
