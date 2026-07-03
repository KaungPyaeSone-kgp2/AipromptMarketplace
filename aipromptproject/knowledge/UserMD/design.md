# Design System

## Detailed Overview
The application is styled entirely with Tailwind CSS, utilizing a highly customized `tailwind.config.js` to enforce a dark, premium, neon-accented aesthetic suitable for an AI marketplace.

## Connected Files
- **`tailwind.config.js`**: Defines the custom color palette, font families, and plugins.
- **`frontend/src/index.css` & `App.css`**: Contain global resets, custom scrollbar utilities (`.custom-scrollbar`, `.app-scrollbar`), and base layer styling.

## Color Palette & Theme Tokens
The theme is strictly dark mode, heavily relying on slate, violet, and deep black hues:
- **Backgrounds**: `background: #09090b` (near black), `surface: #0c0c0f`, `surface-variant: #18181b`.
- **Primary Accents**: `primary: #a78bfa` (violet/purple), `primary-container: #7c3aed`.
- **Secondary/Outlines**: `secondary: #71717a`, `outline: #52525b`, `outline-variant: #27272a`.
- **Semantic Colors**: 
  - Error/Destructive: `#ef4444` (used in report buttons and rejection toasts).
  - Success: `#34d399` (emerald green).
  - Warning/Drafts: Amber shades (e.g., `#f59e0b`).

## UI Elements & Hover States
- **Buttons & Interactive Elements**: Buttons frequently use the primary violet colors with heavy shadow effects (`shadow-lg shadow-violet-600/20`). Disabled states drop opacity (`opacity-50`) and change cursor (`cursor-not-allowed`).
- **Cards & Modals**: Container elements use glassy, semi-transparent backgrounds with borders (e.g., `bg-slate-900/50 border border-slate-700/60`).
- **Hover Effects**: Emphasize transition states: `transition-all hover:border-slate-500/60 hover:bg-slate-900/80 group-hover:text-violet-300`.

## Typography
- **Font Family**: The primary font is **Geist**, applied globally to `headline`, `display`, `body`, and `label` in the Tailwind configuration.

## Plugins
- **`@tailwindcss/forms`**: Resets and standardizes form inputs (textareas, checkboxes) for easier styling.
- **`@tailwindcss/container-queries`**: Allows components to respond to the size of their parent container rather than the viewport.
