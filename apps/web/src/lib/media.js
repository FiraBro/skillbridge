// src/lib/media.js

const API_BASE_URL = "http://localhost:4000";

export function resolveMediaUrl(path) {
  console.log("🧩 resolveMediaUrl input:", path);

  if (!path) {
    console.warn("⚠️ resolveMediaUrl: empty path");
    return null;
  }

  // already full URL
  if (path.startsWith("http")) {
    console.log("✅ Full URL detected:", path);
    return path;
  }

  // ensure leading slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const finalUrl = `${API_BASE_URL}${normalizedPath}`;
  console.log("✅ Resolved media URL:", finalUrl);

  return finalUrl;
}
