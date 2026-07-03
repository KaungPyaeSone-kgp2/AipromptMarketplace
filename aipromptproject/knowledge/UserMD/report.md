# Report Feature

## Detailed Overview
The report feature allows users to report other users, prompts, or comments/reviews to the platform administrators. It provides a robust modal interface that collects specific reasons, optional descriptions, and image evidence for the report.

## Connected Files

### Frontend
- **`frontend/src/users/components/ReportButton.jsx`**: The primary UI component. It renders a flag icon trigger button and a React Portal-based `ReportModal`.
  - **Props**: `targetType` ("prompt" | "creator" | "user" | "comment"), `targetId`, `reasons` (optional override), `className`.
  - **Reasons Configuration**: Predefines specific reasons for each target type (e.g., spam, copyright violation, NSFW, fake content).
  - **Form Data**: Collects the selected reason, an optional description (if "Other" is selected), and optional image evidence.
  - **Events**: Upon successful submission, it dispatches a `promptai:force-notification-update` event to instantly refresh the notification count.
- **`frontend/src/users/pages/UserReports.jsx`**: Displays a user's report history. Includes two tabs: "Submitted" (reports the user filed) and "Against Me" (reports filed against the user, filtering out prompt-specific reports for privacy/relevance). Displays report status tags (pending, resolved, rejected).
- **`frontend/src/users/pages/CreatorReports.jsx`**: A specific dashboard for creators to manage reports related to their prompts.

### Backend
- **`backend/users/reports/submitReport.php`**: Receives the POST request, processes the target type and ID, handles the image upload for evidence, and inserts a new record into the appropriate table (`prompt_reports`, `user_reports`, or `bad_review_reports`). Also inserts a notification record so the reported user (or admin) is notified.
- **`backend/users/reports/getReports.php`**: Fetches the user's submitted reports and reports against the user, standardizing the response payload.
- **Database Tables**: `prompt_reports`, `user_reports`, `bad_review_reports`, `notifications`.

## Data Structure & Table Joins

When data is pulled into the frontend (via `getReports.php`), it is separated into two main categories: `submitted` (reports the user filed) and `received` (reports filed against the user). The backend performs specific table joins to append necessary contextual data to the reports before sending them to the frontend:

### 1. Submitted Reports (User is the reporter)
- **Prompt Reports**: `prompt_reports` `LEFT JOIN prompts` (on `prompt_id`) to retrieve the `prompt_title`. Sets `target_type` to `'prompt'`.
- **User Reports**: `user_reports` `LEFT JOIN users` (on `reported_user_id`) to retrieve the `reported_username`. Sets `target_type` to `'user'`.
- **Review Reports**: `bad_review_reports` `LEFT JOIN reviews` (on `review_id`) to retrieve the `review_text`. Sets `target_type` to `'comment'`.

### 2. Received Reports (Reports filed against the user)
- **Prompt Reports**: `prompt_reports` `JOIN prompts` (on `prompt_id`) where the prompt's `creator_id` is the user. Retrieves `prompt_title` and sets `target_type` to `'prompt'`.
- **User Reports**: Queries `user_reports` where the `reported_user_id` is the user. Sets `target_type` to `'user'`.
- **Review Reports**: `bad_review_reports` `JOIN reviews` (on `review_id`) where the review's `user_id` is the user. Retrieves `review_text` and sets `target_type` to `'comment'`.

## Step-by-Step Workflow
1. **Trigger**: A user clicks the `<ReportButton>` on a prompt, profile, or review.
2. **Modal Opens**: A React Portal renders the `ReportModal` over the entire application.
3. **Data Entry**: The user selects a predefined reason. If they choose "Other", a text area appears for a custom description. They can also attach an image file.
4. **Submission**: The component sets a loading state (`submitting`), sends the data to `submitReport.php`, and displays a success state.
5. **Event Dispatch**: A custom window event `promptai:force-notification-update` is fired, instructing the `UserLayout` to immediately poll the server for new notifications.
6. **Review**: The user can check the status of their submitted reports on the `/reports` page, viewing detailed cards with timestamps and status indicators.
