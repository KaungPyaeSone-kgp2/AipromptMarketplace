// Central API base URL — reads from Railway environment variable at build time.
// Set VITE_API_BASE_URL in Railway's frontend service environment variables
// to your backend Railway URL, e.g.:
//   VITE_API_BASE_URL=https://the-backendphp-production.up.railway.app
//
// Falls back to empty string for local development (which uses Vite proxy).

let API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Hard fallback for production if the environment variable was missing during build
if (!API_BASE && typeof window !== 'undefined' && window.location.hostname === 'dreamkey.up.railway.app') {
    API_BASE = 'https://the-backendphp-production.up.railway.app';
}

// If VITE_API_BASE_URL was set to just "/api" (like in local .env), 
// we strip it so that `${API_BASE}/api/...` doesn't become `/api/api/...`
if (API_BASE === "/api" || API_BASE.endsWith('/api')) {
    API_BASE = API_BASE.substring(0, API_BASE.length - 4);
}
if (API_BASE.endsWith('/')) {
    API_BASE = API_BASE.substring(0, API_BASE.length - 1);
}

export default API_BASE;
