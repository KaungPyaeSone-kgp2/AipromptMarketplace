# AI Prompt Marketplace — Project Overview

# Table of Contents
1. [Project Structure](#project-structure)
2. [Workflow: Report](#workflow-report)
3. [Workflow: Purchase](#workflow-purchase)
4. [Workflow: Layout](#workflow-layout)
5. [Workflow: Notification](#workflow-notification)
6. [Workflow: Exchange](#workflow-exchange)
7. [Backendflow](#1-all-backend-php-endpoints)

---

## Project Structure

```
aipromptproject/
├── frontend/
│   └── src/
│       ├── App.jsx                        # Root router — defines all app routes
│       ├── main.jsx                       # React entry point
│       ├── index.css                      # Global styles
│       └── users/
│           ├── layouts/
│           │   └── UserLayout.jsx         # Main shell layout (Navbar + Sidebar + Outlet)
│           ├── pages/                     # Route-level page components
│           │   ├── UserHome.jsx           # Home / browse page
│           │   ├── PurchasedPrompt.jsx    # User's purchased prompt library
│           │   ├── PromptDetail.jsx       # Single prompt detail & buy flow
│           │   ├── FullPromptContent.jsx  # Full prompt content (post-purchase)
│           │   ├── CreatorHome.jsx        # Creator landing page
│           │   ├── CreatorDashboard.jsx   # Creator analytics & earnings
│           │   ├── CreatorProfile.jsx     # Public creator/user profile
│           │   ├── CreatePrompt.jsx       # Create / edit prompt form
│           │   ├── ProfileSettings.jsx    # Account & profile settings
│           │   ├── BuyerRating.jsx        # Buyer pending ratings
│           │   ├── CreatorRating.jsx      # Creator pending ratings
│           │   ├── Followings.jsx         # Following / community page
│           │   └── Exchange.jsx           # Coin exchange page
│           ├── components/
│           │   ├── layout/                # Shared layout components
│           │   │   ├── Navbar.jsx         # Top navigation bar
│           │   │   ├── Sidebar.jsx        # Left sidebar shell
│           │   │   ├── SidebarItem.jsx    # Individual sidebar navigation item
│           │   │   ├── SidebarRatingMenu.jsx # Collapsible rating sub-menu
│           │   │   ├── NavIconButton.jsx  # Icon button used in the Navbar
│           │   │   └── ProfileMenu.jsx    # Dropdown profile/account menu
│           │   ├── home/                  # Home page sub-components
│           │   ├── shop/                  # Shop/browse sub-components
│           │   ├── PromptCard.jsx         # Reusable prompt card
│           │   ├── ReportButton.jsx       # Report trigger + modal (portal)
│           │   ├── RatingPromptGroup.jsx  # Grouped prompt rating UI
│           │   ├── Toast.jsx              # Global toast notification
│           │   ├── Icon.jsx               # SVG icon wrapper
│           │   └── Tag.jsx                # Prompt tag badge
│           ├── services/                  # API call helpers (frontend <-> backend)
│           │   ├── apiClient.js           # Base fetch client + base URL resolver
│           │   ├── currentUser.js         # Helper to read current user ID
│           │   ├── promptService.js       # Prompt CRUD, purchase, rating fetches
│           │   ├── reportService.js       # Submit report API call
│           │   ├── reviewService.js       # Review / rating API calls
│           │   ├── userService.js         # User fetch, creator request, notifications
│           │   ├── followService.js       # Follow / unfollow API calls
│           │   ├── followingService.js    # Fetch following list
│           │   └── wishlistService.js     # Wishlist add / remove
│           ├── context/
│           │   └── ShopContext.jsx        # Global cart / shop state (React Context)
│           ├── hooks/                     # Custom React hooks
│           ├── config/                    # App-level config constants
│           ├── constants/                 # Shared constant values
│           ├── data/                      # Static / seed data
│           ├── types/                     # JSDoc / TypeScript-style type definitions
│           └── utils/                     # Utility / helper functions
│
├── backend/
│   ├── database/
│   │   └── Database.php                  # PDO database connection singleton
│   ├── dao/
│   │   └── BaseDAO.php                   # Base Data Access Object (shared DB helpers)
│   ├── prompt/
│   │   ├── createPrompt.php              # Create a new prompt
│   │   └── updatePrompt.php              # Update an existing prompt
│   ├── users/
│   │   ├── user/                         # User account endpoints
│   │   ├── categories/                   # Category endpoints
│   │   ├── exchange/                     # Coin exchange endpoints
│   │   ├── followers/                    # Follow/unfollow endpoints
│   │   ├── notification/                 # Notification endpoints
│   │   ├── prompt/                       # Prompt browsing endpoints
│   │   ├── purchases/                    # Purchase endpoints
│   │   │   ├── createPurchase.php        # Create a new purchase (transactional)
│   │   │   ├── getPurchases.php          # Get all purchases for a user
│   │   │   ├── getPurchaseItems.php      # Get line items for a purchase
│   │   │   └── getPurchasedPrompts.php   # Get prompts a user has purchased
│   │   ├── reports/
│   │   │   └── submitReport.php          # Submit a content/user report
│   │   ├── reviews/                      # Review / rating endpoints
│   │   ├── uploads/                      # File upload handling
│   │   └── wishlist/                     # Wishlist endpoints
│   └── notification/                     # Push notification utilities
│
├── public/                               # Static public assets
├── uploads/                              # Uploaded files (images, evidence)
├── scripts/                              # Build / utility scripts
├── dist/                                 # Production build output (Vite)
├── index.html                            # HTML entry point
├── vite.config.js                        # Vite bundler config
├── tailwind.config.js                    # Tailwind CSS config
├── package.json                          # Frontend dependencies
├── .env                                  # Environment variables (DB credentials, etc.)
└── .gitignore
```

---

## Workflow: Report

The **Report** feature allows users to flag inappropriate prompts, creators, users, or comments directly from the UI.

### Frontend Flow

```
User clicks "Report" button  [ReportButton.jsx]
        |
        v
ReportModal opens via React Portal
(renders into document.body to escape z-index/overflow clipping)
        |
        v
User selects a reason from a contextual list:
  - Prompt  -> Spam | Copyright | NSFW | Fake | Other
  - Creator -> Spam Account | Scam | Harassment | Fake/Impersonation | Copyright | Abuse | Other
  - User    -> (same as Creator)
  - Comment -> Spam | Fake Review | Harassment | Offensive Language | Irrelevant | Misleading | Duplicate | Other
        |
        v
User (optionally) writes a description and attaches image evidence
        |
        v
submitReport() called  [reportService.js]
  POST multipart/form-data -> /backend/users/reports/submitReport.php
  Fields: target_type, target_id, reason, reporter_id, description, image_evidence (optional file)
```

### Backend Flow

```
submitReport.php receives POST request
        |
        v
Validate required fields:
  - reporter_id  (must be a valid integer > 0)
  - target_id    (must be a valid integer > 0)
  - target_type  (must be one of: prompt | creator | user | comment)
  - reason       (must be in the allowed list for the given target_type)
        |
        v
(Optional) Save image evidence file to backend/uploads/image_evidence_report/user_account_image_evidence/
        |
        v
INSERT into reports table:
  reporter_id, target_type, target_id, reason, description, image_evidence_path
        |
        v
Return JSON: { success: true, message: "Report submitted successfully" }
```

### Key Files

| Layer | File | Role |
|---|---|---|
| Frontend | `components/ReportButton.jsx` | Trigger button + modal UI via React Portal |
| Frontend | `services/reportService.js` | `submitReport()` — sends FormData to backend |
| Backend | `users/reports/submitReport.php` | Validates, saves evidence, inserts report record |

---

## Workflow: Purchase

The **Purchase** feature lets users buy prompts using in-app coins. It is a fully atomic SQL transaction — either everything succeeds or everything is rolled back.

### Frontend Flow

```
User browses prompts on UserHome / PromptDetail
        |
        v
User adds prompt(s) to cart  [ShopContext.jsx]
        |
        v
User confirms checkout on PromptDetail.jsx
        |
        v
createPurchase() called  [promptService.js]
  POST application/json -> /backend/users/purchases/createPurchase.php
  Body: { user_id, total_coin_paid, items: [{ prompt_id, price_in_coins }] }
        |
        v
On success -> purchased prompts appear in PurchasedPrompt.jsx (/purchased route)
User can navigate to FullPromptContent.jsx to read the full unlocked prompt
```

### Backend Flow

```
createPurchase.php receives POST request
        |
        v
Validate:
  - user_id  (valid integer > 0)
  - items[]  (at least one item required)
        |
        v
BEGIN TRANSACTION
        |
        |---> Check for duplicate purchases
        |       SELECT COUNT(*) FROM purchases JOIN purchases_items
        |       WHERE buyer_id = ? AND prompt_id = ?
        |       -> Throw exception if user already owns the prompt
        |
        |---> Lock buyer's coin balance (SELECT ... FOR UPDATE)
        |       -> Throw exception if insufficient coins
        |
        |---> Deduct coins from buyer's coin_balance
        |
        |---> INSERT into purchases table  (buyer_id, total_coin_paid)
        |
        |---> INSERT into purchases_items  (purchase_id, prompt_id, price_in_coins)
        |       for each item in the cart
        |
        |---> Credit creator's coin_balance for each item
        |       UPDATE users SET coin_balance = coin_balance + ? WHERE id = creator_id
        |
        v
COMMIT TRANSACTION
        |
        v
Return JSON: { success: true, purchase_id: <new_id> }
```

### Related Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `createPurchase.php` | POST | Create purchase & transfer coins atomically |
| `getPurchases.php` | GET | List all purchase records for a user |
| `getPurchaseItems.php` | GET | Get line items for a specific purchase |
| `getPurchasedPrompts.php` | GET | Get all prompts a user currently owns |

---

## Workflow: Layout

The **Layout** system provides the persistent shell (Navbar + Sidebar) that wraps every authenticated page via React Router nested routing.

### Routing Structure

```
main.jsx  (ReactDOM.createRoot)
    |
    v
App.jsx  (React Router <Routes>)
    |
    v
<Route element={<UserLayout />}>     <- persistent shell rendered on every route
    |
    v
<Outlet />                           <- page-level component injected here
    |
    +-- /                 -> UserHome
    +-- /purchased        -> PurchasedPrompt
    +-- /followings       -> Followings
    +-- /prompt/:id       -> PromptDetail
    +-- /prompt/:id/full  -> FullPromptContent
    +-- /creator/:id      -> CreatorProfile
    +-- /settings/profile -> ProfileSettings
    +-- /rating/buyer     -> BuyerRating
    +-- /rating/creator   -> CreatorRating  (CreatorOnly)
    +-- /creator          -> CreatorHome    (CreatorOnly)
    +-- /creator/creatordashboard -> CreatorDashboard (CreatorOnly)
    +-- /creator/promptcreate/:id? -> CreatePrompt  (CreatorOnly)
    +-- /exchange         -> ExchangePage
```

### UserLayout.jsx — Responsibilities

On mount and on route change, `UserLayout` fetches all data needed by the shell:

```
loadLayoutData() runs on mount / isCreatorMode change:
  ├── fetchCurrentUser()                -> user profile & creator status
  ├── fetchUnreadNotificationCount()    -> badge count on notification icon
  ├── fetchBuyerRatings()               -> pending buyer rating count
  ├── fetchCreatorRatings()             -> pending creator rating count
  └── fetchCreatorRequestStatus()       -> creator application: pending|approved|rejected
```

State exposed to child pages via `useOutletContext()`:

| State Key | Type | Description |
|---|---|---|
| `user` | Object | Current logged-in user data |
| `isCreatorMode` | Boolean | Whether user is in creator mode |
| `notificationCount` | Number | Unread notification badge count |
| `libraryCount` | Number | Number of purchased prompts |
| `buyerRatingCount` | Number | Prompts awaiting buyer rating |
| `creatorRatingCount` | Number | Prompts awaiting creator rating |
| `searchQuery` | String | Controlled search input value |
| `reloadCurrentUser()` | Function | Re-fetch user data from any child page |
| `refreshNotificationCount()` | Function | Re-fetch notification count |

### Layout Components

| Component | Location | Role |
|---|---|---|
| `UserLayout.jsx` | `layouts/` | Root shell — data fetching, state, context provider |
| `Navbar.jsx` | `components/layout/` | Top bar — search input, notification icon, profile menu |
| `ProfileMenu.jsx` | `components/layout/` | Dropdown — settings, creator mode toggle, logout |
| `NavIconButton.jsx` | `components/layout/` | Reusable icon button used inside the Navbar |
| `Sidebar.jsx` | `components/layout/` | Left sidebar shell — renders navigation items |
| `SidebarItem.jsx` | `components/layout/` | Single clickable sidebar navigation link |
| `SidebarRatingMenu.jsx` | `components/layout/` | Collapsible sub-menu for Buyer / Creator ratings |

### Creator-Only Route Guard

Creator-specific pages are wrapped by `<CreatorOnly>` in `App.jsx`:

```jsx
function CreatorOnly({ children }) {
  const { isCreatorMode } = useOutletContext();
  if (!isCreatorMode) return <Navigate to="/" replace />;
  return children;
}
```

Pages protected by `<CreatorOnly>`:
- `/rating/creator` — Creator Rating page
- `/creator` — Creator Home
- `/creator/creatordashboard` — Creator Dashboard
- `/creator/promptcreate/:promptId?` — Create / Edit Prompt

---

## Workflow: Notification

The **Notification** feature delivers in-app alerts to users (e.g. report status updates, creator approval decisions). The badge count is loaded on every page load via `UserLayout`, and the full list is fetched on demand when the user opens the bell dropdown in `Navbar`.

### Frontend Flow

```
UserLayout mounts (on every route)
        |
        v
fetchUnreadNotificationCount()  [userService.js]
  GET /api/users/notification/getUnreadCount.php?user_id=<id>
  -> sets notificationCount in UserLayout state
  -> passed as prop to Navbar -> displayed as badge number on the bell icon
        |
        v
User clicks the Bell icon  [Navbar.jsx]
        |
        v
loadNotifications() runs:
  GET /api/users/notification/getNotifications.php?user_id=<id>
  -> fetches up to 20 unread notifications (newest first)
  -> includes reference data joined from prompt_reports / user_reports / bad_review_reports
  -> sets notifications[] in local Navbar state
  -> opens the dropdown panel
        |
        v
Dropdown renders each notification with:
  - title, message, type, reference_type
  - relative timestamp ("2m ago", "3h ago", "5d ago")  via formatTimeAgo()
  - dismiss (X) button per item
  - "Clear All" button at the top of the dropdown
```

#### Dismiss a Single Notification

```
User clicks X on a notification
        |
        v
handleDismiss(id) runs  [Navbar.jsx]
  |
  |---> Adds id to dismissingIds set  (triggers CSS exit animation)
  |
  |---> POST /api/users/notification/markRead.php
  |       Body: { user_id, notification_id }
  |       -> marks that single row: is_read = 1 in DB
  |
  |---> After 300ms (animation delay):
          - Removes notification from local state
          - Calls onNotificationChange(-1) -> decrements badge count by 1 in UserLayout
```

#### Clear All Notifications

```
User clicks "Clear All"
        |
        v
handleClearAll() runs  [Navbar.jsx]
  |
  |---> Adds ALL notification ids to dismissingIds set (batch exit animation)
  |
  |---> POST /api/users/notification/markRead.php
  |       Body: { user_id, mark_all: true }
  |       -> UPDATE notifications SET is_read = 1
  |          WHERE user_id = ? AND is_read = 0
  |
  |---> After 300ms:
          - Clears notifications[] from local state
          - Calls onNotificationChange(-cleared) -> resets badge to 0 in UserLayout
```

### Backend Flow

#### `getUnreadCount.php` — Badge Count

```
GET ?user_id=<id>
        |
        v
Validate user_id (must be integer > 0)
        |
        v
SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0
        |
        v
Return JSON: { success: true, count: <integer> }
```

#### `getNotifications.php` — Load Notification List

```
GET ?user_id=<id>
        |
        v
Validate user_id
        |
        v
SELECT n.id, n.type, n.title, n.message, n.is_read, n.created_at,
       n.reference_id, n.reference_type,
       COALESCE(pr.status, ur.status, br.status)                          AS report_status,
       COALESCE(pr.report_description, ur.report_description, ...)        AS report_description
FROM notifications n
LEFT JOIN prompt_reports pr     ON reference_type = 'prompt_report'  AND reference_id = pr.id
LEFT JOIN user_reports ur       ON reference_type = 'user_report'    AND reference_id = ur.id
LEFT JOIN bad_review_reports br ON reference_type = 'review_report'  AND reference_id = br.id
WHERE n.user_id = ? AND n.is_read = 0
ORDER BY n.created_at DESC
LIMIT 20
        |
        v
Return JSON: { success: true, data: [ ...notifications ] }
```

#### `markRead.php` — Mark as Read

```
POST JSON Body: { user_id, notification_id?, mark_all? }
        |
        v
Validate user_id (required)
        |
        +--> if mark_all = true:
        |       UPDATE notifications SET is_read = 1
        |       WHERE user_id = ? AND is_read = 0
        |
        +--> else if notification_id provided:
                UPDATE notifications SET is_read = 1
                WHERE id = ? AND user_id = ?
        |
        v
Return JSON: { success: true, affected: <rowCount> }
```

### Notification Data Model

| Field | Type | Description |
|---|---|---|
| `id` | INT | Primary key |
| `user_id` | INT | Recipient user |
| `type` | VARCHAR | Notification category (e.g. `report_update`) |
| `title` | VARCHAR | Short heading shown in the dropdown |
| `message` | TEXT | Full notification body text |
| `is_read` | TINYINT | `0` = unread, `1` = read / dismissed |
| `reference_id` | INT | ID of the linked entity (report, purchase, etc.) |
| `reference_type` | VARCHAR | `prompt_report` / `user_report` / `review_report` |
| `created_at` | DATETIME | Timestamp used for relative time display |

### Key Files

| Layer | File | Role |
|---|---|---|
| Frontend | `components/layout/Navbar.jsx` | Bell icon, dropdown UI, dismiss & clear-all logic |
| Frontend | `services/userService.js` | `fetchUnreadNotificationCount()` — badge polling on load |
| Frontend | `layouts/UserLayout.jsx` | Fetches badge count on mount, passes count to Navbar |
| Backend | `users/notification/getUnreadCount.php` | Returns unread badge count for the current user |
| Backend | `users/notification/getNotifications.php` | Returns up to 20 unread notifications with joined report data |
| Backend | `users/notification/markRead.php` | Marks one or all notifications as read (`is_read = 1`) |

---

## Workflow: Exchange

The **Exchange** feature lets users convert real-world money (Myanmar Kyat / MMK) into in-app **Coins** by selecting a coin package, choosing a mobile payment provider, entering an amount, and uploading a transaction receipt for manual verification.

> **Exchange Rate:** 1,000 MMK = 1 Coin (fixed rate, displayed prominently in the UI).

---

### Step 1 — Coin Package Selection (CoinPackageSelection.jsx)

> Route: `/exchange/packages`
> File: `frontend/src/pages/CoinPackageSelection.jsx`

Users first choose one of six tiered coin packages. Larger packages include bonus coins and a lower MMK-per-coin rate.

**Available Packages:**

| ID | Name | Base Coins | Bonus Coins | Total Coins | Price (MMK) |
|---|---|---|---|---|---|
| `starter` | Starter | 100 | 0 | 100 | 1,000 |
| `basic` | Basic | 500 | 25 | 525 | 4,500 |
| `popular` | Popular | 1,200 | 100 | 1,300 | 10,000 |
| `pro` | Pro | 2,500 | 300 | 2,800 | 19,000 |
| `elite` | Elite | 6,000 | 1,000 | 7,000 | 44,000 |
| `ultimate` | Ultimate | 15,000 | 3,000 | 18,000 | 99,000 |

**UI behaviour:**
- Clicking a package card highlights it and updates the summary banner (base coins, bonus, total, MMK price).
- A **Value Comparison** bar chart shows coins-per-1,000-MMK across all packages so users can compare value at a glance.
- The **Confirm Package** button calls `onSelect(selectedPackage)` to pass the chosen package upstream or navigate to Step 2.

```
User visits /exchange/packages
        |
        v
CoinPackageSelection renders 6 package cards
        |
        v
User clicks a card  ->  selectedId state updates
        |
        v
Summary banner + value bar chart update reactively
        |
        v
User clicks "Confirm Package"
        |
        v
onSelect(selectedPackage) fires  ->  navigates to Exchange form (Step 2)
```

---

### Step 2 — Exchange Form (Exchange.jsx)

> Route: `/exchange`
> File: `frontend/src/users/pages/Exchange.jsx`

The main exchange page handles payment provider selection, MMK amount input, QR display, and receipt upload.

#### Frontend Flow

```
Exchange.jsx mounts
        |
        v
useEffect -> fetchPaymentMethods()
  GET /api/users/exchange/getPaymentMethods.php
  -> populates paymentMethods[] state
  -> auto-selects first method (setSelectedId)
        |
        v
Page renders two-column layout (lg:grid-cols-12, left 7 cols / right 5 cols):

LEFT COLUMN                          RIGHT COLUMN
Exchange Rate Banner                 Transfer Details panel
  "1,000 MMK = 1 Coin"                account name, phone, QR code image

Provider Selection grid              Receipt Upload
  [KBZ Pay] [Aya Pay] [Wave Pay]       file drop zone  ->  preview card

Amount Input (MMK)
  formatted with thousands separator
  onChange strips non-digits

Estimated Points (read-only)
  = (amount / 1000).toFixed(2) PTS
        |
        v
"Confirm Exchange" button
  -> (insertexchange.php — pending implementation)
```

#### QR URL Resolution

The `resolveQrUrl(path)` helper normalises QR image paths from the database:

```
path starts with "http"      -> use as-is
path starts with "backend/"  -> replace "backend/" with "/api/"
path includes "uploads/"     -> prepend "/api/" if not already absolute
fallback                     -> /api/uploads/payment_method_info/{path}
```

#### Provider Metadata (client-side mapping by DB id)

| DB ID | Provider | Logo File |
|---|---|---|
| 1 | KBZ Pay | `/kpaylogo.png` |
| 2 | Aya Pay | `/ayapaylogo.jfif` |
| 3 | Wave Pay | `/wavepay.jfif` |

#### Receipt Upload

```
User clicks the dashed upload zone
        |
        v
<input type="file"> accepts: image/png, image/jpeg, image/jpg, application/pdf
        |
        v
File selected -> setReceipt(file)
        |
        v
Preview card renders:
  - Image thumbnail (if image/*) OR file icon (if PDF)
  - File name + size in KB
  - "X" button -> setReceipt(null) to clear
```

---

### Backend Endpoints

#### `getPaymentMethods.php` — Fetch Payment Providers

```
GET /api/users/exchange/getPaymentMethods.php
        |
        v
SELECT id, account_name, account_phone_number, account_qr_image
FROM payment_method_info
        |
        v
Return JSON: { success: true, data: [ ...methods ] }
```

| Field | Type | Description |
|---|---|---|
| `id` | INT | Provider ID (maps to PROVIDER_META on the frontend) |
| `account_name` | VARCHAR | Receiver account name shown to the user |
| `account_phone_number` | VARCHAR | Receiver phone number |
| `account_qr_image` | VARCHAR | Relative or absolute path to the QR code image |

#### `insertexchange.php` — Submit Exchange Request (stub — not yet implemented)

```
POST /api/users/exchange/insertexchange.php
Expected Body (planned):
  {
    user_id,
    package_id,
    amount_mmk,
    payment_method_id,
    receipt_image   (file upload)
  }
        |
        v
(Planned) Validate fields -> save receipt -> INSERT exchange_requests record
        |
        v
(Planned) Admin reviews receipt -> manually credits user coin_balance
```

> insertexchange.php is currently an empty stub. The Confirm Exchange button does not yet POST to any backend endpoint.

---

### State Summary (Exchange.jsx)

| State | Type | Description |
|---|---|---|
| `paymentMethods` | Array | List of payment providers fetched from DB |
| `selectedId` | Number / null | Currently selected payment provider DB ID |
| `amount` | String | Raw MMK amount (digits only, no commas) |
| `estimatedPoints` | String | Derived: `(amount / 1000).toFixed(2)` |
| `receipt` | File / null | Uploaded receipt file object |
| `uploading` | Boolean | Reserved for future async upload state |

---

### Key Files

| Layer | File | Role |
|---|---|---|
| Frontend | `users/pages/CoinPackageSelection.jsx` | Step 1 — Package picker with value comparison bar |
| Frontend | `users/pages/Exchange.jsx` | Step 2 — Provider selection, amount input, QR display, receipt upload |
| Backend | `users/exchange/getPaymentMethods.php` | Returns all active payment providers with QR data |
| Backend | `users/exchange/insertexchange.php` | (Stub) Will handle exchange submission and receipt storage |
| Router | `App.jsx` | Routes `/exchange` to Exchange.jsx, `/exchange/packages` to CoinPackageSelection.jsx |

## 1. All Backend PHP Endpoints

### backend/database/Database.php

- Not an API endpoint. PDO connection class.

### backend/dao/BaseDAO.php

- Not an API endpoint. Shared DAO helper (select, insert, update methods).

---
### Prompt CRUD

#### backend/prompt/createPrompt.php

- Method: POST (multipart/form-data)
- Accepts: title, description, prompt_content, category_id, price, tags, use_case, ai_model, creator_id, thumbnail (file)
- DB tables: `prompts` (INSERT), `prompt_tags` (INSERT)
- Returns: `{ success, message, prompt_id }`

#### backend/prompt/updatePrompt.php

- Method: POST (multipart/form-data)
- Accepts: prompt_id, title, description, prompt_content, category_id, price, tags, use_case, ai_model, creator_id, thumbnail (file, optional)
- DB tables: `prompts` (UPDATE), `prompt_tags` (DELETE + INSERT)
- Returns: `{ success, message }`

---
### User Endpoints (backend/users/user/)

#### getUser.php

- Method: GET `?user_id=<id>`
- DB tables: `users` (SELECT), `creator_data` (LEFT JOIN)
- Returns: `{ success, data: { id, user_name, user_email, user_bio, profile_image, creator_mode, coin_balance, ... } }`

#### getCreator.php

- Method: GET `?creator_id=<id>`
- DB tables: `users u` JOIN `creator_data cd`
- Returns: `{ success, data: { id, user_name, user_bio, profile_image, total_sales, total_prompts, followers, ... } }`

#### updateUser.php

- Method: POST (multipart/form-data)
- Accepts: user_id, user_bio, profile_image (file)
- DB tables: `users` (SELECT then UPDATE)
- Image logic: Saves exclusively to `uploads/users/profile/`
- Returns: `{ success, message, data: { ...updated fields } }`

#### updatecreatormode.php

- Method: POST
- Accepts: user_id, withdraw_password
- DB tables: `users` (UPDATE), `creator_data` (INSERT ON DUPLICATE KEY)
- Image logic: Moves profile image from `uploads/users/profile/` to `uploads/creators/profile/`
- Returns: `{ success, message, creator_mode, data }`

---
### Categories (backend/users/categories/)

#### getAllCategories.php

- Method: GET
- DB tables: `categories`
- Returns: `{ success, data: [{ id, name, description }] }`

---
### Prompt Browsing (backend/users/prompt/)

#### getAllprompts.php

- Method: GET `?category=<id>&search=<term>&sort=<field>`
- DB tables: `prompts` JOIN `users` JOIN `categories`, LEFT JOIN `prompt_tags`
- Returns: `{ success, data: [{ id, title, description, price, thumbnail, creator_name, profile_image, category_name, tags, avg_rating, total_reviews, total_sales }] }`

---
### Followers (backend/users/followers/)

#### follow.php

- Method: POST
- Accepts: `{ follower_id, following_id }`
- DB tables: `followers` (INSERT), `creator_data` (UPDATE follower count)
- Returns: `{ success, message }`

#### unfollow.php

- Method: POST
- Accepts: `{ follower_id, following_id }`
- DB tables: `followers` (DELETE), `creator_data` (UPDATE follower count)
- Returns: `{ success, message }`

#### checkFollow.php

- Method: GET `?follower_id=<id>&following_id=<id>`
- DB tables: `followers` (SELECT COUNT)
- Returns: `{ success, is_following: true|false }`

#### getFollowersList.php

- Method: GET `?user_id=<id>`
- DB tables: `followers` JOIN `users`
- Returns: `{ success, data: [{ id, user_name, profile_image, user_bio }] }`

#### getFollowingList.php

- Method: GET `?user_id=<id>`
- DB tables: `followers` JOIN `users`
- Returns: `{ success, data: [{ id, user_name, profile_image, user_bio }] }`

#### getFollowerCount.php

- Method: GET `?user_id=<id>`
- DB tables: `followers` (SELECT COUNT)
- Returns: `{ success, count }`

#### getFollowingCount.php

- Method: GET `?user_id=<id>`
- DB tables: `followers` (SELECT COUNT)
- Returns: `{ success, count }`

---
### Purchases (backend/users/purchases/)

(Already documented in overviewproject.md)

---
### Reports (backend/users/reports/)

#### submitReport.php

(Already documented — now updated with descriptive filename logic)

---
### Reviews (backend/users/reviews/)

#### getreviews.php

- Method: GET `?prompt_id=<id>`
- DB tables: `reviews` JOIN `users`
- Returns: `{ success, data: [{ id, user_id, user_name, reviewer_profile_image, rating, comment, created_at }] }`

#### submitReview.php

- Method: POST
- Accepts: `{ user_id, prompt_id, rating, comment }`
- DB tables: `reviews` (INSERT), `prompts` (UPDATE avg_rating, total_reviews)
- Returns: `{ success, message }`

#### getBuyerPendingRatings.php

- Method: GET `?user_id=<id>`
- DB tables: `purchases_items` JOIN `prompts` LEFT JOIN `reviews` — finds purchased prompts not yet reviewed
- Returns: `{ success, data: [...unrated prompts] }`

#### getCreatorPendingRatings.php

- Method: GET `?creator_id=<id>`
- DB tables: `reviews` JOIN `prompts` — finds unresponded reviews on creator's prompts
- Returns: `{ success, data: [...pending reviews] }`

#### submitCreatorResponse.php

- Method: POST
- Accepts: `{ review_id, creator_id, response }`
- DB tables: `reviews` (UPDATE creator_response)
- Returns: `{ success, message }`

---
### Wishlist (backend/users/wishlist/)

#### addToWishlist.php

- Method: POST
- Accepts: `{ user_id, prompt_id }`
- DB tables: `wishlists` (INSERT)
- Returns: `{ success, message }`

#### removeFromWishlist.php

- Method: POST
- Accepts: `{ user_id, prompt_id }`
- DB tables: `wishlists` (DELETE)
- Returns: `{ success, message }`

#### getWishlist.php

- Method: GET `?user_id=<id>`
- DB tables: `wishlists` JOIN `prompts` JOIN `users` (as creator)
- Returns: `{ success, data: [{ prompt details with creator info }] }`

#### checkWishlist.php

- Method: GET `?user_id=<id>&prompt_id=<id>`
- DB tables: `wishlists` (SELECT COUNT)
- Returns: `{ success, in_wishlist: true|false }`

---
### Exchange (backend/users/exchange/)

(Already documented)

### Notification (backend/users/notification/)

(Already documented)

---
## 2. Frontend Service Files

### services/apiClient.js

- Base URL: Resolves from `import.meta.env.VITE_API_BASE` or defaults to `/api`
- Exports: `apiClient` — thin wrapper around `fetch()` that prepends base URL
- Helper: `resolveAssetUrl(path)` — converts relative backend paths to full URLs

### services/currentUser.js

- Exports: `getCurrentUserId()` — reads user ID from localStorage

### services/promptService.js

- `fetchAllPrompts(params)` → GET `/users/prompt/getAllprompts.php`
- `fetchPromptById(id)` → GET `/users/prompt/getAllprompts.php?prompt_id=<id>`
- `createPurchase(data)` → POST `/users/purchases/createPurchase.php`
- `fetchPurchasedPrompts(userId)` → GET `/users/purchases/getPurchasedPrompts.php`
- `fetchPurchaseItems(purchaseId)` → GET `/users/purchases/getPurchaseItems.php`

### services/reportService.js

- `submitReport(formData)` → POST `/users/reports/submitReport.php`

### services/reviewService.js

- `fetchReviews(promptId)` → GET `/users/reviews/getreviews.php`
- `submitReview(data)` → POST `/users/reviews/submitReview.php`
- `fetchBuyerPendingRatings(userId)` → GET `/users/reviews/getBuyerPendingRatings.php`
- `fetchCreatorPendingRatings(creatorId)` → GET `/users/reviews/getCreatorPendingRatings.php`
- `submitCreatorResponse(data)` → POST `/users/reviews/submitCreatorResponse.php`

### services/userService.js

- `fetchCurrentUser(userId)` → GET `/users/user/getUser.php`
- `fetchCreator(creatorId)` → GET `/users/user/getCreator.php`
- `updateUser(formData)` → POST `/users/user/updateUser.php`
- `requestCreatorMode(data)` → POST `/users/user/updatecreatormode.php`
- `fetchUnreadNotificationCount(userId)` → GET `/users/notification/getUnreadCount.php`
- `fetchNotifications(userId)` → GET `/users/notification/getNotifications.php`
- `markNotificationRead(data)` → POST `/users/notification/markRead.php`

### services/followService.js

- `followUser(data)` → POST `/users/followers/follow.php`
- `unfollowUser(data)` → POST `/users/followers/unfollow.php`
- `checkFollow(followerId, followingId)` → GET `/users/followers/checkFollow.php`
- `getFollowerCount(userId)` → GET `/users/followers/getFollowerCount.php`
- `getFollowingCount(userId)` → GET `/users/followers/getFollowingCount.php`

### services/followingService.js

- `fetchFollowers(userId)` → GET `/users/followers/getFollowersList.php`
- `fetchFollowing(userId)` → GET `/users/followers/getFollowingList.php`

### services/wishlistService.js

- `addToWishlist(data)` → POST `/users/wishlist/addToWishlist.php`
- `removeFromWishlist(data)` → POST `/users/wishlist/removeFromWishlist.php`
- `fetchWishlist(userId)` → GET `/users/wishlist/getWishlist.php`
- `checkWishlist(userId, promptId)` → GET `/users/wishlist/checkWishlist.php`

---
## 3. Frontend Pages (what they import and call)

### UserHome.jsx

- Calls: `fetchAllPrompts()`, `fetchAllCategories()` (inline fetch to categories endpoint)
- Displays: Prompt grid with PromptCard, category filter tabs, search

### PromptDetail.jsx

- Calls: `fetchPromptById()`, `fetchReviews()`, `checkWishlist()`, `checkFollow()`
- Actions: `createPurchase()`, `addToWishlist()` / `removeFromWishlist()`, `followUser()` / `unfollowUser()`, `submitReport()`

### PurchasedPrompt.jsx

- Calls: `fetchPurchasedPrompts()`
- Displays: Grid of purchased prompts

### FullPromptContent.jsx

- Calls: `fetchPurchaseItems()` or reads from route state
- Displays: Full prompt content (only accessible post-purchase)

### CreatorProfile.jsx

- Calls: `fetchCreator()`, `fetchAllPrompts({ creator_id })`, `checkFollow()`, `getFollowerCount()`, `getFollowingCount()`
- Actions: `followUser()` / `unfollowUser()`, `submitReport()`

### CreatorHome.jsx

- Calls: `fetchAllPrompts({ creator_id: currentUser })`
- Displays: Creator's own prompts

### CreatorDashboard.jsx

- Calls: `fetchCreator()`, `fetchAllPrompts()`, `fetchPurchasedPrompts()`
- Displays: Analytics, earnings, sales charts

### ProfileSettings.jsx

- Calls: `fetchCurrentUser()`, `updateUser()`, `requestCreatorMode()`
- Actions: Upload profile image, edit name/email/bio, request creator mode

### BuyerRating.jsx

- Calls: `fetchBuyerPendingRatings()`
- Actions: `submitReview()`

### CreatorRating.jsx

- Calls: `fetchCreatorPendingRatings()`
- Actions: `submitCreatorResponse()`

### Followings.jsx

- Calls: `fetchFollowers()`, `fetchFollowing()`
- Displays: Follower/following lists

### Exchange.jsx

- Calls: Inline fetch to `getPaymentMethods.php`
- Actions: Receipt upload (submit not yet wired)

### CreatePrompt.jsx

- Calls: `fetchPromptById()` (if editing), `fetchAllCategories()` (inline)
- Actions: POST to `createPrompt.php` or `updatePrompt.php` with FormData (including thumbnail)

---
## 4. Image/Asset URL Resolution

### services/apiClient.js — resolveAssetUrl(path)

```javascript
export function resolveAssetUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^backend\/users\//, "").replace(/^users\//, "");
  const base = import.meta.env.VITE_API_BASE || "/api";
  return `${base}/${clean.startsWith("/") ? clean.slice(1) : clean}`;
}
```

Key transformations:
- Strips leading `backend/users/` or `users/` prefix
- Prepends `/api/` base URL
- Example: `uploads/creators/profile/creator_2.png` → `/api/uploads/creators/profile/creator_2.png`
- Example: `users/uploads/image_evidence_report/...` → `/api/uploads/image_evidence_report/...`

### utils/mapPrompt.js — resolveAssetUrl() usage

- Maps `row.thumbnail` → full URL for prompt card images
- Maps `row.profile_image` → full URL for creator avatars

### services/userService.js — profile image resolution

```javascript
resolveAssetUrl(row.profile_image ?? row.avatar ?? row.avatarUrl) ?? "/default-avatar.png"
```

### services/followService.js — follower avatar

```javascript
resolveAssetUrl(row.profile_image) || "/default-avatar.png"
```

---
## 5. Vite Proxy Config

From `vite.config.js`:

```javascript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
},
```

So:
- Frontend `fetch("/api/users/user/getUser.php")` → proxied to `http://localhost:8000/users/user/getUser.php`
- Frontend `<img src="/api/uploads/creators/profile/creator_2.png">` → proxied to `http://localhost:8000/uploads/creators/profile/creator_2.png`
- The PHP backend serves from a document root that contains `users/`, `uploads/`, `prompt/`, `database/`, `dao/`

---
## 6. Utility Files

### utils/mapPrompt.js

- `mapPromptRow(row)` — normalizes a raw prompt DB row into a UI-friendly object
- Resolves `row.thumbnail` → full image URL via `resolveAssetUrl()`
- Resolves `row.profile_image` → creator avatar URL via `resolveAssetUrl()`
- Builds tags array from comma-separated `row.tags`

### utils/formatPrice.js

- `formatPrice(coins)` — returns formatted coin display string

### utils/slugify.js

- `slugify(text)` — converts text to URL-safe slug

---
## 7. Config Files

### config/apiRoutes.js

Contains all backend endpoint path constants:

```javascript
export const API_ROUTES = {
  GET_USER: "users/user/getUser.php",
  GET_CREATOR: "users/user/getCreator.php",
  UPDATE_USER: "users/user/updateUser.php",
  UPDATE_CREATOR_MODE: "users/user/updatecreatormode.php",
  GET_ALL_PROMPTS: "users/prompt/getAllprompts.php",
  GET_CATEGORIES: "users/categories/getAllCategories.php",
  CREATE_PURCHASE: "users/purchases/createPurchase.php",
  GET_PURCHASED_PROMPTS: "users/purchases/getPurchasedPrompts.php",
  GET_PURCHASE_ITEMS: "users/purchases/getPurchaseItems.php",
  SUBMIT_REPORT: "users/reports/submitReport.php",
  GET_REVIEWS: "users/reviews/getreviews.php",
  SUBMIT_REVIEW: "users/reviews/submitReview.php",
  GET_BUYER_PENDING: "users/reviews/getBuyerPendingRatings.php",
  GET_CREATOR_PENDING: "users/reviews/getCreatorPendingRatings.php",
  SUBMIT_CREATOR_RESPONSE: "users/reviews/submitCreatorResponse.php",
  FOLLOW: "users/followers/follow.php",
  UNFOLLOW: "users/followers/unfollow.php",
  CHECK_FOLLOW: "users/followers/checkFollow.php",
  GET_FOLLOWERS: "users/followers/getFollowersList.php",
  GET_FOLLOWING: "users/followers/getFollowingList.php",
  GET_FOLLOWER_COUNT: "users/followers/getFollowerCount.php",
  GET_FOLLOWING_COUNT: "users/followers/getFollowingCount.php",
  ADD_WISHLIST: "users/wishlist/addToWishlist.php",
  REMOVE_WISHLIST: "users/wishlist/removeFromWishlist.php",
  GET_WISHLIST: "users/wishlist/getWishlist.php",
  CHECK_WISHLIST: "users/wishlist/checkWishlist.php",
  GET_NOTIFICATIONS: "users/notification/getNotifications.php",
  GET_UNREAD_COUNT: "users/notification/getUnreadCount.php",
  MARK_READ: "users/notification/markRead.php",
  GET_PAYMENT_METHODS: "users/exchange/getPaymentMethods.php",
  INSERT_EXCHANGE: "users/exchange/insertexchange.php",
};
```

---
## 8. Page-by-Page Data Flow

### UserHome.jsx

On mount:
- `fetchAllPrompts()` → GET `getAllprompts.php` — all prompts
- Inline fetch → GET `getAllCategories.php` — category tabs

User actions:
- Category filter click → re-fetches with `?category=<id>`
- Search typing → re-fetches with `?search=<term>`
- Sort dropdown → re-fetches with `?sort=<field>`

Image display:
- `mapPromptRow()` resolves `thumbnail` and `profile_image` via `resolveAssetUrl()`

### PromptDetail.jsx

On mount:
- `fetchPromptById(id)` → GET `getAllprompts.php?prompt_id=<id>`
- `fetchReviews(id)` → GET `getreviews.php?prompt_id=<id>`
- `checkWishlist(userId, promptId)` → GET `checkWishlist.php`
- `checkFollow(userId, creatorId)` → GET `checkFollow.php`

User actions:
- "Buy" button → `createPurchase()` → POST `createPurchase.php`
- Wishlist toggle → `addToWishlist()` / `removeFromWishlist()`
- Follow toggle → `followUser()` / `unfollowUser()`
- "Report" button → opens ReportButton modal → `submitReport()`
- Submit review → `submitReview()` → POST `submitReview.php`

Image display:
- Prompt thumbnail: `resolveAssetUrl(prompt.thumbnail)`
- Creator avatar: `resolveAssetUrl(prompt.profile_image)`
- Reviewer avatars: `resolveAssetUrl(review.reviewer_profile_image)`

### PurchasedPrompt.jsx

On mount:
- `fetchPurchasedPrompts(userId)` → GET `getPurchasedPrompts.php?user_id=<id>`

Image display:
- Prompt thumbnails via `resolveAssetUrl()`
- Creator avatars via `resolveAssetUrl()`

### FullPromptContent.jsx

On mount:
- Reads from route `location.state` or fetches `fetchPurchaseItems(purchaseId)`

Display:
- Full prompt content text (unlocked)

### CreatorProfile.jsx

On mount:
- `fetchCreator(creatorId)` → GET `getCreator.php?creator_id=<id>`
- `fetchAllPrompts({ creator_id })` → GET `getAllprompts.php?creator_id=<id>`
- `checkFollow()` → GET `checkFollow.php`
- `getFollowerCount()` / `getFollowingCount()`

User actions:
- Follow/unfollow toggle
- Report button

Image display:
- Creator profile image: `resolveAssetUrl(creator.profile_image)`
- Prompt thumbnails: `resolveAssetUrl()`

### CreatorHome.jsx

On mount:
- `fetchAllPrompts({ creator_id: currentUserId })`

User actions:
- "Create Prompt" button → navigates to `/creator/promptcreate`
- "Edit" on prompt → navigates to `/creator/promptcreate/<id>`

### CreatorDashboard.jsx

On mount:
- `fetchCreator(currentUserId)` → creator stats
- `fetchAllPrompts({ creator_id })` → creator's prompts
- Computes analytics from fetched data (total sales, revenue, top prompts)

### ProfileSettings.jsx

On mount:
- `fetchCurrentUser(userId)` → GET `getUser.php`

User actions:
- Edit name/email/bio fields
- Upload profile image → stored as File in state
- "Save" → `updateUser(formData)` → POST `updateUser.php` (multipart/form-data with `profile_image` file field)
- "Become Creator" → `requestCreatorMode({ user_id, withdraw_password })` → POST `updatecreatormode.php`

Image display:
- Current profile image: `resolveAssetUrl(user.profile_image)` or `URL.createObjectURL(newFile)`

### BuyerRating.jsx

On mount:
- `fetchBuyerPendingRatings(userId)` → GET `getBuyerPendingRatings.php`

User actions:
- Select star rating + write comment → `submitReview()` → POST `submitReview.php`

Image display:
- Prompt thumbnails via `resolveAssetUrl()`

### CreatorRating.jsx

On mount:
- `fetchCreatorPendingRatings(creatorId)` → GET `getCreatorPendingRatings.php`

User actions:
- Write response → `submitCreatorResponse()` → POST `submitCreatorResponse.php`

Image display:
- Reviewer avatars via `resolveAssetUrl()`

### Followings.jsx

On mount:
- `fetchFollowers(userId)` → GET `getFollowersList.php`
- `fetchFollowing(userId)` → GET `getFollowingList.php`

Image display:
- User avatars: `resolveAssetUrl(user.profile_image)` with `/default-avatar.png` fallback

### Exchange.jsx

On mount:
- Inline fetch → GET `getPaymentMethods.php`

User actions:
- Select provider, select package, upload receipt
- "Confirm Exchange" button (not yet wired to backend)

Image display:
- QR codes: `resolveQrUrl(selected.account_qr_image)` (local helper, not `resolveAssetUrl`)

### CreatePrompt.jsx

On mount:
- If editing (`promptId` param): `fetchPromptById(promptId)`
- Inline fetch → `getAllCategories.php`

User actions:
- Fill form fields (title, description, content, category, price, tags, AI model, use case)
- Upload thumbnail image
- "Create" / "Update" → POST `createPrompt.php` or `updatePrompt.php` (multipart/form-data with `thumbnail` file field)


## 1. All Backend PHP Endpoints

  ###  backend/database/Database.php

  • Not an API endpoint. PDO connection class.

  ###  backend/dao/BaseDAO.php

  • Not an API endpoint. Shared DAO helper (select, insert, update methods).
  ──────
  ### Prompt CRUD

  ####  backend/prompt/createPrompt.php

  • Method: POST (multipart/form-data)
  • Accepts: title, description, prompt_content, category_id, price, tags, use_case, ai_model, creator_id, thumbnail
  (file)
  • DB tables:  prompts  (INSERT),  prompt_tags  (INSERT)
  • Returns:  { success, message, prompt_id }

  ####  backend/prompt/updatePrompt.php

  • Method: POST (multipart/form-data)
  • Accepts: prompt_id, title, description, prompt_content, category_id, price, tags, use_case, ai_model, creator_id,
  thumbnail (file, optional)
  • DB tables:  prompts  (UPDATE),  prompt_tags  (DELETE + INSERT)
  • Returns:  { success, message }
  ──────
  ### User Endpoints ( backend/users/user/ )

  ####  getUser.php

  • Method: GET  ?user_id=<id>
  • DB tables:  users  (SELECT),  creator_data  (LEFT JOIN)
  • Returns:  { success, data: { id, user_name, user_email, user_bio, profile_image, creator_mode, coin_balance, ... }
  }

  ####  getCreator.php

  • Method: GET  ?creator_id=<id>
  • DB tables:  users u  JOIN  creator_data cd
  • Returns:  { success, data: { id, user_name, user_bio, profile_image, total_sales, total_prompts, followers, ... }
  }

  ####  updateUser.php

  • Method: POST (multipart/form-data)
  • Accepts: user_id, user_name, user_email, user_bio, profile_image (file)
  • DB tables:  users  (SELECT then UPDATE)
  • Image logic: Saves to  uploads/users/profile/  or  uploads/creators/profile/  based on  creator_mode
  • Returns:  { success, message, data: { ...updated fields } }

  ####  updatecreatormode.php

  • Method: POST
  • Accepts: user_id, withdraw_password
  • DB tables:  users  (UPDATE),  creator_data  (INSERT ON DUPLICATE KEY)
  • Image logic: Moves profile image from  uploads/users/profile/  to  uploads/creators/profile/
  • Returns:  { success, message, creator_mode, data }
  ──────
  ### Categories ( backend/users/categories/ )

  ####  getAllCategories.php

  • Method: GET
  • DB tables:  categories
  • Returns:  { success, data: [{ id, name, description }] }
  ──────
  ### Prompt Browsing ( backend/users/prompt/ )

  ####  getAllprompts.php

  • Method: GET  ?category=<id>&search=<term>&sort=<field>
  • DB tables:  prompts  JOIN  users  JOIN  categories , LEFT JOIN  prompt_tags
  • Returns:  { success, data: [{ id, title, description, price, thumbnail, creator_name, profile_image, category_name,
  tags, avg_rating, total_reviews, total_sales }] }
  ──────
  ### Followers ( backend/users/followers/ )

  ####  follow.php

  • Method: POST
  • Accepts:  { follower_id, following_id }
  • DB tables:  followers  (INSERT),  creator_data  (UPDATE follower count)
  • Returns:  { success, message }

  ####  unfollow.php

  • Method: POST
  • Accepts:  { follower_id, following_id }
  • DB tables:  followers  (DELETE),  creator_data  (UPDATE follower count)
  • Returns:  { success, message }

  ####  checkFollow.php

  • Method: GET  ?follower_id=<id>&following_id=<id>
  • DB tables:  followers  (SELECT COUNT)
  • Returns:  { success, is_following: true|false }

  ####  getFollowersList.php

  • Method: GET  ?user_id=<id>
  • DB tables:  followers  JOIN  users
  • Returns:  { success, data: [{ id, user_name, profile_image, user_bio }] }

  ####  getFollowingList.php

  • Method: GET  ?user_id=<id>
  • DB tables:  followers  JOIN  users
  • Returns:  { success, data: [{ id, user_name, profile_image, user_bio }] }

  ####  getFollowerCount.php

  • Method: GET  ?user_id=<id>
  • DB tables:  followers  (SELECT COUNT)
  • Returns:  { success, count }

  ####  getFollowingCount.php

  • Method: GET  ?user_id=<id>
  • DB tables:  followers  (SELECT COUNT)
  • Returns:  { success, count }
  ──────
  ### Purchases ( backend/users/purchases/ )

  (Already documented in overviewproject.md)
  ──────
  ### Reports ( backend/users/reports/ )

  ####  submitReport.php

  (Already documented — now updated with descriptive filename logic)
  ──────
  ### Reviews ( backend/users/reviews/ )

  ####  getreviews.php

  • Method: GET  ?prompt_id=<id>
  • DB tables:  reviews  JOIN  users
  • Returns:  { success, data: [{ id, user_id, user_name, reviewer_profile_image, rating, comment, created_at }] }

  ####  submitReview.php

  • Method: POST
  • Accepts:  { user_id, prompt_id, rating, comment }
  • DB tables:  reviews  (INSERT),  prompts  (UPDATE avg_rating, total_reviews)
  • Returns:  { success, message }

  ####  getBuyerPendingRatings.php

  • Method: GET  ?user_id=<id>
  • DB tables:  purchases_items  JOIN  prompts  LEFT JOIN  reviews  — finds purchased prompts not yet reviewed
  • Returns:  { success, data: [...unrated prompts] }

  ####  getCreatorPendingRatings.php

  • Method: GET  ?creator_id=<id>
  • DB tables:  reviews  JOIN  prompts  — finds unresponded reviews on creator's prompts
  • Returns:  { success, data: [...pending reviews] }

  ####  submitCreatorResponse.php

  • Method: POST
  • Accepts:  { review_id, creator_id, response }
  • DB tables:  reviews  (UPDATE creator_response)
  • Returns:  { success, message }
  ──────
  ### Wishlist ( backend/users/wishlist/ )

  ####  addToWishlist.php

  • Method: POST
  • Accepts:  { user_id, prompt_id }
  • DB tables:  wishlists  (INSERT)
  • Returns:  { success, message }

  ####  removeFromWishlist.php

  • Method: POST
  • Accepts:  { user_id, prompt_id }
  • DB tables:  wishlists  (DELETE)
  • Returns:  { success, message }

  ####  getWishlist.php

  • Method: GET  ?user_id=<id>
  • DB tables:  wishlists  JOIN  prompts  JOIN  users  (as creator)
  • Returns:  { success, data: [{ prompt details with creator info }] }

  ####  checkWishlist.php

  • Method: GET  ?user_id=<id>&prompt_id=<id>
  • DB tables:  wishlists  (SELECT COUNT)
  • Returns:  { success, in_wishlist: true|false }
  ──────
  ### Exchange ( backend/users/exchange/ )

  (Already documented)

  ### Notification ( backend/users/notification/ )

  (Already documented)
  ──────
  ## 2. Frontend Service Files

  ###  services/apiClient.js

  • Base URL: Resolves from  import.meta.env.VITE_API_BASE  or defaults to  /api
  • Exports:  apiClient  — thin wrapper around  fetch()  that prepends base URL
  • Helper:  resolveAssetUrl(path)  — converts relative backend paths to full URLs

  ###  services/currentUser.js

  • Exports:  getCurrentUserId()  — reads user ID from localStorage

  ###  services/promptService.js

  •  fetchAllPrompts(params)  → GET  /users/prompt/getAllprompts.php
  •  fetchPromptById(id)  → GET  /users/prompt/getAllprompts.php?prompt_id=<id>
  •  createPurchase(data)  → POST  /users/purchases/createPurchase.php
  •  fetchPurchasedPrompts(userId)  → GET  /users/purchases/getPurchasedPrompts.php
  •  fetchPurchaseItems(purchaseId)  → GET  /users/purchases/getPurchaseItems.php

  ###  services/reportService.js

  •  submitReport(formData)  → POST  /users/reports/submitReport.php

  ###  services/reviewService.js

  •  fetchReviews(promptId)  → GET  /users/reviews/getreviews.php
  •  submitReview(data)  → POST  /users/reviews/submitReview.php
  •  fetchBuyerPendingRatings(userId)  → GET  /users/reviews/getBuyerPendingRatings.php
  •  fetchCreatorPendingRatings(creatorId)  → GET  /users/reviews/getCreatorPendingRatings.php
  •  submitCreatorResponse(data)  → POST  /users/reviews/submitCreatorResponse.php

  ###  services/userService.js

  •  fetchCurrentUser(userId)  → GET  /users/user/getUser.php
  •  fetchCreator(creatorId)  → GET  /users/user/getCreator.php
  •  updateUser(formData)  → POST  /users/user/updateUser.php
  •  requestCreatorMode(data)  → POST  /users/user/updatecreatormode.php
  •  fetchUnreadNotificationCount(userId)  → GET  /users/notification/getUnreadCount.php
  •  fetchNotifications(userId)  → GET  /users/notification/getNotifications.php
  •  markNotificationRead(data)  → POST  /users/notification/markRead.php

  ###  services/followService.js

  •  followUser(data)  → POST  /users/followers/follow.php
  •  unfollowUser(data)  → POST  /users/followers/unfollow.php
  •  checkFollow(followerId, followingId)  → GET  /users/followers/checkFollow.php
  •  getFollowerCount(userId)  → GET  /users/followers/getFollowerCount.php
  •  getFollowingCount(userId)  → GET  /users/followers/getFollowingCount.php

  ###  services/followingService.js

  •  fetchFollowers(userId)  → GET  /users/followers/getFollowersList.php
  •  fetchFollowing(userId)  → GET  /users/followers/getFollowingList.php

  ###  services/wishlistService.js

  •  addToWishlist(data)  → POST  /users/wishlist/addToWishlist.php
  •  removeFromWishlist(data)  → POST  /users/wishlist/removeFromWishlist.php
  •  fetchWishlist(userId)  → GET  /users/wishlist/getWishlist.php
  •  checkWishlist(userId, promptId)  → GET  /users/wishlist/checkWishlist.php
  ──────
  ## 3. Frontend Pages (what they import and call)

  ###  UserHome.jsx

  • Calls:  fetchAllPrompts() ,  fetchAllCategories()  (inline fetch to categories endpoint)
  • Displays: Prompt grid with PromptCard, category filter tabs, search

  ###  PromptDetail.jsx

  • Calls:  fetchPromptById() ,  fetchReviews() ,  checkWishlist() ,  checkFollow()
  • Actions:  createPurchase() ,  addToWishlist() / removeFromWishlist() ,  followUser() / unfollowUser() ,
  submitReport()

  ###  PurchasedPrompt.jsx

  • Calls:  fetchPurchasedPrompts()
  • Displays: Grid of purchased prompts

  ###  FullPromptContent.jsx

  • Calls:  fetchPurchaseItems()  or reads from route state
  • Displays: Full prompt content (only accessible post-purchase)

  ###  CreatorProfile.jsx

  • Calls:  fetchCreator() ,  fetchAllPrompts({ creator_id }) ,  checkFollow() ,  getFollowerCount() ,
  getFollowingCount()
  • Actions:  followUser() / unfollowUser() ,  submitReport()

  ###  CreatorHome.jsx

  • Calls:  fetchAllPrompts({ creator_id: currentUser })
  • Displays: Creator's own prompts

  ###  CreatorDashboard.jsx

  • Calls:  fetchCreator() ,  fetchAllPrompts() ,  fetchPurchasedPrompts()
  • Displays: Analytics, earnings, sales charts

  ###  ProfileSettings.jsx

  • Calls:  fetchCurrentUser() ,  updateUser() ,  requestCreatorMode()
  • Actions: Upload profile image, edit name/email/bio, request creator mode

  ###  BuyerRating.jsx

  • Calls:  fetchBuyerPendingRatings()
  • Actions:  submitReview()

  ###  CreatorRating.jsx

  • Calls:  fetchCreatorPendingRatings()
  • Actions:  submitCreatorResponse()

  ###  Followings.jsx

  • Calls:  fetchFollowers() ,  fetchFollowing()
  • Displays: Follower/following lists

  ###  Exchange.jsx

  • Calls: Inline fetch to  getPaymentMethods.php
  • Actions: Receipt upload (submit not yet wired)

  ###  CreatePrompt.jsx

  • Calls:  fetchPromptById()  (if editing),  fetchAllCategories()  (inline)
  • Actions: POST to  createPrompt.php  or  updatePrompt.php  with FormData (including thumbnail)
  ──────
  ## 4. Image/Asset URL Resolution

  ###  services/apiClient.js  —  resolveAssetUrl(path)

    export function resolveAssetUrl(path) {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      const clean = path.replace(/^backend\/users\//, "").replace(/^users\//, "");
      const base = import.meta.env.VITE_API_BASE || "/api";
      return `base/{clean.startsWith("/") ? clean.slice(1) : clean}`;
    }

  Key transformations:

  • Strips leading  backend/users/  or  users/  prefix
  • Prepends  /api/  base URL
  • Example:  uploads/creators/profile/creator_2.png  →  /api/uploads/creators/profile/creator_2.png
  • Example:  users/uploads/image_evidence_report/...  →  /api/uploads/image_evidence_report/...

  ###  utils/mapPrompt.js  —  resolveAssetUrl()  usage

  • Maps  row.thumbnail  → full URL for prompt card images
  • Maps  row.profile_image  → full URL for creator avatars

  ###  services/userService.js  — profile image resolution

    resolveAssetUrl(row.profile_image ?? row.avatar ?? row.avatarUrl) ?? "/default-avatar.png"

  ###  services/followService.js  — follower avatar

    resolveAssetUrl(row.profile_image) || "/default-avatar.png"
  ──────
  ## 5. Vite Proxy Config

  From  vite.config.js :

    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },

  So:

  • Frontend  fetch("/api/users/user/getUser.php")  → proxied to  http://localhost:8000/users/user/getUser.php
  • Frontend  <img src="/api/uploads/creators/profile/creator_2.png">  → proxied to
  http://localhost:8000/uploads/creators/profile/creator_2.png
  • The PHP backend serves from a document root that contains  users/ ,  uploads/ ,  prompt/ ,  database/ ,  dao/

  [Message from subagent 4b1ffb98-e323-4a7c-9402-de44f8c6e863 (Frontend pages researcher)]

  Here is the structured research for the frontend pages and supporting files:
  ──────
  ##  apiClient.js  — Base URL & Fetch Wrapper

    const BASE = import.meta.env.VITE_API_BASE ?? "/api";

    export async function apiClient(path, opts = {}) {
      const url = `BASE/{path.replace(/^\//, "")}`;
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }

    export function resolveAssetUrl(path) {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      const clean = path
        .replace(/^backend\/users\//, "")
        .replace(/^users\//, "");
      return `BASE/{clean.startsWith("/") ? clean.slice(1) : clean}`;
    }
  ──────
  ##  vite.config.js  — Proxy

    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    }

  All  /api/*  requests are proxied to  http://localhost:8000/*  with the  /api  prefix stripped.
  ──────
  ## Utility Files

  ###  utils/mapPrompt.js

  •  mapPromptRow(row)  — normalizes a raw prompt DB row into a UI-friendly object
  • Resolves  row.thumbnail  → full image URL via  resolveAssetUrl()
  • Resolves  row.profile_image  → creator avatar URL via  resolveAssetUrl()
  • Builds tags array from comma-separated  row.tags

  ###  utils/formatPrice.js

  •  formatPrice(coins)  — returns formatted coin display string

  ###  utils/slugify.js

  •  slugify(text)  — converts text to URL-safe slug
  ──────
  ## Config Files

  ###  config/apiRoutes.js

  Contains all backend endpoint path constants:

    export const API_ROUTES = {
      GET_USER: "users/user/getUser.php",
      GET_CREATOR: "users/user/getCreator.php",
      UPDATE_USER: "users/user/updateUser.php",
      UPDATE_CREATOR_MODE: "users/user/updatecreatormode.php",
      GET_ALL_PROMPTS: "users/prompt/getAllprompts.php",
      GET_CATEGORIES: "users/categories/getAllCategories.php",
      CREATE_PURCHASE: "users/purchases/createPurchase.php",
      GET_PURCHASED_PROMPTS: "users/purchases/getPurchasedPrompts.php",
      GET_PURCHASE_ITEMS: "users/purchases/getPurchaseItems.php",
      SUBMIT_REPORT: "users/reports/submitReport.php",
      GET_REVIEWS: "users/reviews/getreviews.php",
      SUBMIT_REVIEW: "users/reviews/submitReview.php",
      GET_BUYER_PENDING: "users/reviews/getBuyerPendingRatings.php",
      GET_CREATOR_PENDING: "users/reviews/getCreatorPendingRatings.php",
      SUBMIT_CREATOR_RESPONSE: "users/reviews/submitCreatorResponse.php",
      FOLLOW: "users/followers/follow.php",
      UNFOLLOW: "users/followers/unfollow.php",
      CHECK_FOLLOW: "users/followers/checkFollow.php",
      GET_FOLLOWERS: "users/followers/getFollowersList.php",
      GET_FOLLOWING: "users/followers/getFollowingList.php",
      GET_FOLLOWER_COUNT: "users/followers/getFollowerCount.php",
      GET_FOLLOWING_COUNT: "users/followers/getFollowingCount.php",
      ADD_WISHLIST: "users/wishlist/addToWishlist.php",
      REMOVE_WISHLIST: "users/wishlist/removeFromWishlist.php",
      GET_WISHLIST: "users/wishlist/getWishlist.php",
      CHECK_WISHLIST: "users/wishlist/checkWishlist.php",
      GET_NOTIFICATIONS: "users/notification/getNotifications.php",
      GET_UNREAD_COUNT: "users/notification/getUnreadCount.php",
      MARK_READ: "users/notification/markRead.php",
      GET_PAYMENT_METHODS: "users/exchange/getPaymentMethods.php",
      INSERT_EXCHANGE: "users/exchange/insertexchange.php",
    };
  ──────
  ## Page-by-Page Data Flow

  ###  UserHome.jsx

  On mount:

  •  fetchAllPrompts()  → GET  getAllprompts.php  — all prompts
  • Inline fetch → GET  getAllCategories.php  — category tabs

  User actions:

  • Category filter click → re-fetches with  ?category=<id>
  • Search typing → re-fetches with  ?search=<term>
  • Sort dropdown → re-fetches with  ?sort=<field>

  Image display:

  •  mapPromptRow()  resolves  thumbnail  and  profile_image  via  resolveAssetUrl()
  ──────
  ###  PromptDetail.jsx

  On mount:

  •  fetchPromptById(id)  → GET  getAllprompts.php?prompt_id=<id>
  •  fetchReviews(id)  → GET  getreviews.php?prompt_id=<id>
  •  checkWishlist(userId, promptId)  → GET  checkWishlist.php
  •  checkFollow(userId, creatorId)  → GET  checkFollow.php

  User actions:

  • "Buy" button →  createPurchase()  → POST  createPurchase.php
  • Wishlist toggle →  addToWishlist()  /  removeFromWishlist()
  • Follow toggle →  followUser()  /  unfollowUser()
  • "Report" button → opens ReportButton modal →  submitReport()
  • Submit review →  submitReview()  → POST  submitReview.php

  Image display:

  • Prompt thumbnail:  resolveAssetUrl(prompt.thumbnail)
  • Creator avatar:  resolveAssetUrl(prompt.profile_image)
  • Reviewer avatars:  resolveAssetUrl(review.reviewer_profile_image)
  ──────
  ###  PurchasedPrompt.jsx

  On mount:

  •  fetchPurchasedPrompts(userId)  → GET  getPurchasedPrompts.php?user_id=<id>

  Image display:

  • Prompt thumbnails via  resolveAssetUrl()
  • Creator avatars via  resolveAssetUrl()
  ──────
  ###  FullPromptContent.jsx

  On mount:

  • Reads from route  location.state  or fetches  fetchPurchaseItems(purchaseId)

  Display:

  • Full prompt content text (unlocked)
  ──────
  ###  CreatorProfile.jsx

  On mount:

  •  fetchCreator(creatorId)  → GET  getCreator.php?creator_id=<id>
  •  fetchAllPrompts({ creator_id })  → GET  getAllprompts.php?creator_id=<id>
  •  checkFollow()  → GET  checkFollow.php
  •  getFollowerCount()  /  getFollowingCount()

  User actions:

  • Follow/unfollow toggle
  • Report button

  Image display:

  • Creator profile image:  resolveAssetUrl(creator.profile_image)
  • Prompt thumbnails:  resolveAssetUrl()
  ──────
  ###  CreatorHome.jsx

  On mount:

  •  fetchAllPrompts({ creator_id: currentUserId })

  User actions:

  • "Create Prompt" button → navigates to  /creator/promptcreate
  • "Edit" on prompt → navigates to  /creator/promptcreate/<id>
  ──────
  ###  CreatorDashboard.jsx

  On mount:

  •  fetchCreator(currentUserId)  → creator stats
  •  fetchAllPrompts({ creator_id })  → creator's prompts
  • Computes analytics from fetched data (total sales, revenue, top prompts)
  ──────
  ###  ProfileSettings.jsx

  On mount:

  •  fetchCurrentUser(userId)  → GET  getUser.php

  User actions:

  • Edit name/email/bio fields
  • Upload profile image → stored as File in state
  • "Save" →  updateUser(formData)  → POST  updateUser.php  (multipart/form-data with  profile_image  file field)
  • "Become Creator" →  requestCreatorMode({ user_id, withdraw_password })  → POST  updatecreatormode.php

  Image display:

  • Current profile image:  resolveAssetUrl(user.profile_image)  or  URL.createObjectURL(newFile)
  ──────
  ###  BuyerRating.jsx

  On mount:

  •  fetchBuyerPendingRatings(userId)  → GET  getBuyerPendingRatings.php

  User actions:

  • Select star rating + write comment →  submitReview()  → POST  submitReview.php

  Image display:

  • Prompt thumbnails via  resolveAssetUrl()
  ──────
  ###  CreatorRating.jsx

  On mount:

  •  fetchCreatorPendingRatings(creatorId)  → GET  getCreatorPendingRatings.php

  User actions:

  • Write response →  submitCreatorResponse()  → POST  submitCreatorResponse.php

  Image display:

  • Reviewer avatars via  resolveAssetUrl()
  ──────
  ###  Followings.jsx

  On mount:

  •  fetchFollowers(userId)  → GET  getFollowersList.php
  •  fetchFollowing(userId)  → GET  getFollowingList.php

  Image display:

  • User avatars:  resolveAssetUrl(user.profile_image)  with  /default-avatar.png  fallback
  ──────
  ###  Exchange.jsx

  On mount:

  • Inline fetch → GET  getPaymentMethods.php

  User actions:

  • Select provider, select package, upload receipt
  • "Confirm Exchange" button (not yet wired to backend)

  Image display:

  • QR codes:  resolveQrUrl(selected.account_qr_image)  (local helper, not  resolveAssetUrl )
  ──────
  ###  CreatePrompt.jsx

  On mount:

  • If editing ( promptId  param):  fetchPromptById(promptId)
  • Inline fetch →  getAllCategories.php

  User actions:

  • Fill form fields (title, description, content, category, price, tags, AI model, use case)
  • Upload thumbnail image
  • "Create" / "Update" → POST  createPrompt.php  or  updatePrompt.php  (multipart/form-data with  thumbnail  file
  field)
