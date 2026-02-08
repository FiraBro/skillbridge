export async function getDevelopers({
  search = "",
  minReputation = 0,
  page = 1,
  limit = 9,
}) {
  const res = await fetch(
    `/api/companies/discovery?search=${search}&minReputation=${minReputation}&page=${page}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch developers");
  }

  return res.json();
}

export async function getBookmarks() {
  const res = await fetch("/api/companies/bookmarks");
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function toggleBookmark(devId, isBookmarked) {
  const method = isBookmarked ? "DELETE" : "POST";
  const res = await fetch(`/api/companies/bookmarks/${devId}`, { method });
  if (!res.ok) throw new Error("Bookmark failed");
}
