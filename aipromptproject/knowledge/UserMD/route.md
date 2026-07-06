# Routing System

## Detailed Overview
The application uses React Router v6 for client-side routing. All route configurations are centralized within `App.jsx`, utilizing nested routes, layout wrappers, and custom route guard components.

## Connected Files

### Frontend
- **`frontend/src/App.jsx`**: The central routing hub containing the `<Routes>` and `<Route>` definitions.
- **`frontend/src/main.jsx`**: Wraps the `<App />` in a `<BrowserRouter>` to supply the routing context to the app.

## Workflow and Route Architecture

### The Layout Wrapper
Almost all routes are nested inside `<Route element={<UserLayout />}>`. This ensures the Navbar and Sidebar do not remount when navigating between pages, preserving their local state (like notification counts and search inputs).

### Public & User Routes
- `/` -> `UserHome.jsx`: The main feed.
- `/purchased` -> `PurchasedPrompt.jsx`: Library of bought prompts.
- `/followings` -> `Followings.jsx`: Feed from followed creators.
- `/prompt/:promptId` -> `PromptDetail.jsx`: Detailed view of a specific prompt.
- `/user/:userId` -> `CreatorProfile.jsx`: Public profile pages.
- `/reports` -> `UserReports.jsx`: The user's submitted and received reports.
- `/exchange` -> `ExchangePage.jsx`: Coin exchange and wallet interface.
- `/settings/profile` -> `ProfileSettings.jsx`: User profile settings.

### Guarded Creator Routes
The application uses a custom Higher Order Component (HOC) called `<CreatorOnly>`. This component checks the `isCreatorMode` variable passed from `useOutletContext()`. If false, it forcefully redirects the user back to `/` using `<Navigate to="/" replace />`.
Protected routes include:
- `/rating/creator` -> `CreatorRating.jsx`
- `/creator/reports` -> `CreatorReports.jsx`
- `/creator/creatordashboard` -> `CreatorDashboard.jsx`

### Fallbacks & Legacy Redirects
- Paths like `/community` and `/favorites` are legacy routes that immediately `<Navigate>` the user to `/followings` and `/rating/buyer`, respectively.
- A wildcard route `*` catches any unknown URLs and redirects to `/`.
