// Central API base URL — reads from Railway environment variable at build time.
// Set VITE_API_BASE_URL in Railway's frontend service environment variables
// to your backend Railway URL, e.g.:
//   VITE_API_BASE_URL=https://the-backendphp-production.up.railway.app
//
// Falls back to localhost:8000 for local development.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default API_BASE;
