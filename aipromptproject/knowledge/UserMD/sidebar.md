# Sidebar Component

## Detailed Overview
The Sidebar provides high-level persistent navigation for the application, sitting sticky on the left side of the screen. It is aware of the user's "Creator Mode" status and adjusts the available links accordingly.

## Connected Files

### Frontend
- **`frontend/src/users/components/layout/Sidebar.jsx`**: The main container component. It receives props like `isCreatorMode`, `buyerRatingCount`, and `creatorRatingCount` from the `UserLayout`.
- **`frontend/src/users/components/layout/SidebarItem.jsx`**: A reusable link component. It uses React Router's `NavLink` or custom routing logic to handle active states, applying special background colors and highlights when the user is on that specific route.
- **`frontend/src/users/components/layout/SidebarRatingMenu.jsx`**: A specialized sub-menu within the sidebar dedicated to reviews and ratings. It displays badges indicating the number of pending/active ratings the user needs to attend to.
- **`frontend/src/users/components/Icon.jsx`**: An SVG library file supplying standard icons (HomeIcon, CommunityIcon, FlagIcon, CreatorIcon).

## Design Details
- **Positioning**: Uses Tailwind classes `sticky top-16 z-50 flex h-[calc(100vh-4rem)] w-16 shrink-0 flex-col`. This keeps it locked to the left side while the main content scrolls, taking exactly the height of the viewport minus the navbar height.
- **Aesthetics**: Features a semi-transparent dark background `rgba(8, 13, 28, 0.96)`.
- **Interactions**: Uses hover effects to expand icons or show tooltips, keeping the sidebar narrow (16 units, approx 64px) to maximize screen real estate for the main content grid.

## Step-by-Step Workflow
1. The `Sidebar` is mounted by `UserLayout` and remains persistent across route changes.
2. If `isCreatorMode` is true, additional links like "My Prompts" (`/creator`) are rendered.
3. Badges on items like `SidebarRatingMenu` are populated by state passed down from the layout's backend polling.
