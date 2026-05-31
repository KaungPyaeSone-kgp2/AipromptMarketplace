const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE;
}

export async function apiGet(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}/${path.replace(/^\//, "")}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...options.headers },
    ...options,
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON from ${path}`);
  }

  if (!response.ok) {
    throw new Error(data?.message ?? `API ${response.status}: ${path}`);
  }

  if (data && data.success === false) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

export async function apiPost(path, body, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}/${path.replace(/^\//, "")}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON from ${path}`);
  }

  if (!response.ok) {
    throw new Error(data?.message ?? `API ${response.status}: ${path}`);
  }

  return data;
}
