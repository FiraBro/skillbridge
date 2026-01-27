export async function fetchRepoStars(repoUrl) {
  try {
    const [, , , owner, repo] = repoUrl.split("/");
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count;
  } catch {
    return null; // graceful degradation
  }
}
