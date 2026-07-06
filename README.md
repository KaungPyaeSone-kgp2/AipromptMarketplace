# AI Prompt Marketplace

A full-stack AI prompt marketplace with a React frontend, PHP backend, and Node.js WebSocket server.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend API | PHP 8+ (PDO/MySQL) |
| WebSocket | Node.js + Socket.io |
| Database | MySQL |

---

## ⚡ Quick Setup After `git clone` or `git pull`

### Prerequisites
- Node.js 18+ and npm
- PHP 8.0+ with Composer
- MySQL running locally

### Step 1 — Install Node dependencies (Frontend + WebSocket)
```bash
npm install
```

### Step 2 — Install PHP dependencies (Backend)
```bash
cd backend
composer install
cd ..
```

### Step 3 — Set up the database
- Create a MySQL database named `image_prompt_db`
- Import any SQL schema files if provided

### Step 4 — Configure secrets
Copy the example config and fill in your credentials:
```bash
# Create backend/config.ini with your local values:
[Google OAuth]
GOOGLE_CLIENT_ID = "your_google_client_id"
GOOGLE_CLIENT_SECRET = "your_google_client_secret"

[Email Config]
EMAIL_USERNAME = "your_email@gmail.com"
EMAIL_PASSWORD = "your_app_password"
```

> **Note:** `config.ini` is excluded from git (contains secrets). Each developer must create it locally.

### Step 5 — Run the development server
```bash
npm run dev
```
This starts all 3 services concurrently:
- **Frontend** (Vite) → http://localhost:5173
- **Backend API** (PHP) → http://localhost:8000
- **WebSocket server** (Node.js) → http://localhost:3001

---

## 🚀 Deployment (Railway)

See the full Railway deployment guide in the project documentation.

### Environment Variables for Production

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (provided by Railway) |
| `DB_NAME` | Database name |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EMAIL_USERNAME` | SMTP email address |
| `EMAIL_PASSWORD` | SMTP app password |

---

## 📁 Project Structure

```
aipromptproject/
├── frontend/          # React + Vite app
├── backend/           # PHP API
│   ├── api/           # API endpoints
│   ├── config/        # DB connection (Database.php)
│   ├── config.ini     # ⚠️ Secrets (NOT in git)
│   └── vendor/        # ⚠️ Composer deps (NOT in git)
├── websocket/         # Node.js Socket.io server
│   └── socket-server/server.js
├── node_modules/      # ⚠️ npm deps (NOT in git)
└── package.json
```

---

## 👥 Team Members' Branch Workflow

1. Each team member works on their own branch (e.g., `kaungpyaesone`)
2. Changes are merged into `main` via pull requests
3. After pulling, always re-run `npm install` and `composer install` if `package.json` or `composer.json` changed
