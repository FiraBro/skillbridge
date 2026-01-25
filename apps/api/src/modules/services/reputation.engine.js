export function calculateReputation({ skillsCount, githubStats, joinedAt }) {
  const skillScore = skillsCount * 10;

  const githubScore =
    githubStats.publicRepos * 5 +
    githubStats.followers * 3 +
    githubStats.totalStars * 2 +
    githubStats.totalCommits * 0.1;

  const accountAgeDays =
    (Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24);

  const longevityScore = Math.min(accountAgeDays / 30, 50);

  return Math.round(skillScore + githubScore + longevityScore);
}
