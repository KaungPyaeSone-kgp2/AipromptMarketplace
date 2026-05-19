const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE_URL ??
  API_BASE.replace(/\/api\/?$/, "");

export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = ASSETS_BASE.replace(/\/$/, "");
  const normalized = String(path).replace(/^\//, "");
  return `${base}/${normalized}`;
}
