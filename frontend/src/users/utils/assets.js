import API_BASE_CONFIG from "../../config/api";

const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE_URL ??
  (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "") : "");

export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = ASSETS_BASE.replace(/\/$/, "");
  const normalized = String(path)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^backend\/users\//, "")
    .replace(/^users\/uploads\//, "uploads/");
  return `${base}/${normalized}`;
}
