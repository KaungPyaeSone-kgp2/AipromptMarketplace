// Central API base URL
// Because the frontend and backend are now hosted on the exact same domain
// via the Unified Monolith Dockerfile, the API_BASE is simply an empty string.
// This allows axios/fetch to make native relative requests (e.g., /api/login_register/...)

let API_BASE = "/api";

// Ensure no trailing slashes if ever modified in the future
if (API_BASE.endsWith('/')) {
    API_BASE = API_BASE.substring(0, API_BASE.length - 1);
}

export default API_BASE;
