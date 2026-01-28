export function calculateReputation({
  skillsCount = 0,
  githubStats = {},
  joinedAt,
}) {
  // Ensure we have numbers even if keys are missing
  const skills = skillsCount || 0;
  const repos = githubStats.publicRepos || 0;
  const followers = githubStats.followers || 0;
  const stars = githubStats.totalStars || 0;
  const commits = githubStats.totalCommits || 0;
  const commits30d = githubStats.commits30d || githubStats.commits_30d || 0;
  const isActive = githubStats.isActive || githubStats.is_active || false;

  const skillScore = skills * 10;

  const githubScore = repos * 5 + followers * 3 + stars * 2 + commits * 0.1;

  // Activity bonus (reward recent activity)
  const activityBonus = isActive ? commits30d * 2 : 0;

  // Handle case where joinedAt might be invalid/missing
  const joinDate = new Date(joinedAt).getTime();
  const accountAgeDays = isNaN(joinDate)
    ? 0
    : (Date.now() - joinDate) / (1000 * 60 * 60 * 24);

  const longevityScore = Math.min(accountAgeDays / 30, 50);

  const finalScore = Math.round(
    skillScore + githubScore + activityBonus + longevityScore,
  );

  // Final safety check: if everything fails, return 0 instead of crashing the DB
  return isNaN(finalScore) ? 0 : finalScore;
}
