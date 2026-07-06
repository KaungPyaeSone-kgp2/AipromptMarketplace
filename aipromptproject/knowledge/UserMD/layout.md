# Layout System

## Detailed Overview
The application utilizes a persistent, stateful layout component (`UserLayout.jsx`) that wraps all authenticated or public-facing user routes. It serves as the central hub for user state, polling, event listeners, and broad UI orchestrations like the "Become a Creator" flow.

## Connected Files

### Frontend
- **`frontend/src/users/layouts/UserLayout.jsx`**: The core wrapper component.
  - **State Management**: Holds `user`, `notificationCount`, `libraryCount`, `buyerRatingCount`, `creatorRatingCount`, `searchQuery`, and `isCreatorMode`.
  - **Creator Request Flow**: Contains complex modal logic (`showCreatorConfirm`, `creatorStep`, `withdrawPassword`) for users applying to be creators. It polls `fetchCreatorRequestStatus` every 15 seconds if a request is pending, showing an animated toast when approved or rejected.
  - **Event Listeners**: Listens for `promptai:user-profile-updated`, `promptai:purchase-success`, and `RATINGS_UPDATED_EVENT` to seamlessly update layout data without page reloads.
- **`frontend/src/users/components/layout/Navbar.jsx`**: The top navigation bar. Receives props like `user`, `notificationCount`, `searchQuery`, and functions to handle sign-outs and creator mode toggling.
- **`frontend/src/users/components/layout/Sidebar.jsx`**: The side navigation menu. Receives `isCreatorMode` and notification badges.

## Step-by-Step Workflow
1. **Initial Load**: `UserLayout.jsx` mounts and uses `Promise.all` to concurrently fetch the current user, unread notifications, buyer/creator ratings, and creator request status.
2. **Rendering**: It renders the `Navbar` component, the `Sidebar` component side-by-side with a `<main>` tag that contains the React Router `<Outlet />`.
3. **Dynamic Context**: It provides a context object (`{ isCreatorMode, searchQuery, reloadCurrentUser }`) to all child routes rendered inside the `<Outlet />`, allowing deeply nested pages to trigger layout updates.
4. **Creator Polling**: If a user has submitted a creator application, `UserLayout` polls the server every 15 seconds. Once approved, it shows a 5-second countdown toast, reloads the user object, and switches the UI to creator mode seamlessly.
