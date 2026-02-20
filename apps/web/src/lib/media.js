// src/lib/media.js

const API_BASE_URL = "http://localhost:4000";

export function resolveMediaUrl(path) {
  if (!path) {
    return null;
  }

  // already full URL
  if (path.startsWith("http")) {
    return path;
  }

  // ensure leading slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const finalUrl = `${API_BASE_URL}${normalizedPath}`;

  return finalUrl;
}
