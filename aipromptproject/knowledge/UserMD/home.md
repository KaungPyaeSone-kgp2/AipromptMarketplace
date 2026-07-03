# Home Page

## Detailed Overview
The home page is the primary discovery engine of the marketplace. It is dynamically filtered based on user preferences, search queries from the Navbar, and the accounts the user follows.

## Connected Files

### Frontend
- **`frontend/src/users/pages/UserHome.jsx`**: The main feed for regular users and buyers.
  - **State Hooks**: Uses `useOutletContext` to grab the `searchQuery` from the Navbar. Maintains local state for `selectedModels` (e.g., ChatGPT, Midjourney), `selectedCategories`, `minRating`, and `followingIds`.
  - **Data Fetching**: Calls `fetchFollowingAccounts` on mount to customize the feed. Passes all filters into a custom hook `useHomePrompts(filters)`.
- **`frontend/src/users/components/home/HomeFilters.jsx`**: The UI component that renders pill buttons for categories and models, allowing users to toggle filters on and off.
- **`frontend/src/users/components/home/PromptGrid.jsx`**: Receives the filtered `prompts` array from the hook and renders them in a responsive CSS grid layout using `PromptCard.jsx`.
- **`frontend/src/users/pages/CreatorHome.jsx`**: An alternative home page specifically tailored for creators to manage their own published prompts and drafts.

## Step-by-Step Workflow
1. **Navigation**: User hits the `/` route, loading `UserHome.jsx`.
2. **Context & Fetching**: The component retrieves the global search query. It asynchronously fetches the IDs of creators the user follows to prioritize or filter content.
3. **Filtering**: As the user clicks category or model toggles in `HomeFilters`, the `filters` memoized object updates.
4. **Hook Execution**: The `useHomePrompts` custom hook detects the changed filters, triggers a loading state, and fetches the matched prompts from the backend API.
5. **Rendering**: `PromptGrid` displays a loading skeleton, then transitions to showing the actual prompt cards once data is resolved.
