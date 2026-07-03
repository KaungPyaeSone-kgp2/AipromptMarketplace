# Firebase Integration Guide for AI Prompt Marketplace

This document outlines how Firebase Firestore has been integrated into the AI Prompt Marketplace to provide real-time updates for prompts across all connected clients.

## 🏗 Architecture Overview

We use a hybrid approach where **PHP + MySQL** remains the single source of truth for all data, while **Firebase Firestore** acts purely as a real-time notification engine (Pub/Sub).

1. **Frontend (React)**: Listens to a specific document in Firestore (`app_events/prompts_updated`).
2. **Backend (PHP)**: Processes database inserts/updates normally in MySQL. Upon success, it securely authenticates with Firebase as an Admin and updates the `prompts_updated` document.
3. **The Loop**: When the PHP backend updates the Firestore document, all connected React clients instantly detect the change and trigger a local re-fetch of the prompts from your PHP API.

---

## 📂 Files Edited & Created for Firebase

Here is a comprehensive list of the files that were modified or created to establish this connection:

### Frontend (React)
*   **`frontend/package.json`**: Added `firebase` NPM package.
*   **`frontend/src/firebase.js`**: Configured Firebase using your public API keys and exported the `db` (Firestore) instance.
*   **`frontend/src/FirebaseListener.jsx` [NEW]**: A headless (invisible) React component that subscribes to the `app_events/prompts_updated` document. Upon changes, it calls your existing `clearPromptCache()` function to refresh the UI.
*   **`frontend/src/App.jsx`**: Injected `<FirebaseListener />` at the top of your React router so that it's always running globally.

### Backend (PHP)
*   **`backend/composer.json` [NEW]**: Created to install `kreait/firebase-php` (the official Firebase Admin SDK for PHP).
*   **`backend/firebase_helper.php` [NEW]**: A script containing the `pushPromptUpdateToFirebase()` function. It handles the secure authentication using your Service Account and pushes the update signal to Firestore.
*   **`backend/prompt/createPrompt.php`**: Added a call to `pushPromptUpdateToFirebase()` right after a successful `INSERT` into MySQL.
*   **`backend/prompt/updatePrompt.php`**: Added a call to `pushPromptUpdateToFirebase()` right after a successful `UPDATE` in MySQL.

---

## 🛠 Step-by-Step: How to Use Firebase Now

The code integration is **100% complete**. However, for security reasons, the PHP backend cannot speak to Firebase until you provide it with an Admin Key. 

To activate the real-time features, follow these final steps:

### Step 1: Get the Firebase Admin Key
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Select your `aipromptlibrary` project.
3. Click the **Gear Icon ⚙️** (top left) > **Project settings**.
4. Go to the **Service accounts** tab.
5. Click **Generate new private key** and download the `.json` file to your computer.

### Step 2: Place the Key in the Backend
1. Rename the downloaded file to exactly: `firebase-credentials.json`
2. Move it into your `backend` folder: `D:\aipromptmarketplace\AipromptMarketplace\aipromptproject\backend\firebase-credentials.json`
3. *Note: The code is designed to safely ignore Firebase if this file is missing, so your app won't crash while you are setting this up.*

### Step 3: Test It!
1. Open your React frontend in **two different browser windows** side-by-side.
2. In Window A, create a new prompt or edit an existing one.
3. Watch Window B — as soon as Window A saves the prompt, Window B will instantly and automatically update to show the changes without you clicking refresh!

---

## 🔒 Security Note
**Never upload `firebase-credentials.json` to GitHub.** It provides full administrative access to your Firebase project. It has already been added to your `.gitignore` rules (if it wasn't, please ensure it is).
