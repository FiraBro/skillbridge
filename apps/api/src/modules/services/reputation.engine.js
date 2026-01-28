export function calculateReputation({
  skillsCount = 0,
  githubStats = {},
  joinedAt,
  postsCount = 0,
  totalLikes = 0,
  projectsCount = 0,
  endorsementsCount = 0,
}) {
  // Ensure we have numbers even if keys are missing
  const skills = skillsCount || 0;
  const repos = githubStats.publicRepos || 0;
  const followers = githubStats.followers || 0;
  const stars = githubStats.totalStars || 0;
  const commits = githubStats.totalCommits || 0;
  const commits30d = githubStats.commits30d || githubStats.commits_30d || 0;
  const isActive = githubStats.isActive || githubStats.is_active || false;

  // Skills score
  const skillScore = skills * 10;

  // GitHub contribution score
  const githubScore = repos * 5 + followers * 3 + stars * 2 + commits * 0.1;

  // Activity bonus (reward recent activity)
  const activityBonus = isActive ? commits30d * 2 : 0;

  // Posts & engagement score
  const postsScore = postsCount * 15; // Base points for creating content
  const likesScore = totalLikes * 3; // Points for receiving engagement
  const contentScore = postsScore + likesScore;

  // Projects score
  const projectScore = projectsCount * 20; // Higher value for completed projects

  // Endorsements score (peer validation is valuable)
  const endorsementScore = endorsementsCount * 25;

  // Handle case where joinedAt might be invalid/missing
  const joinDate = new Date(joinedAt).getTime();
  const accountAgeDays = isNaN(joinDate)
    ? 0
    : (Date.now() - joinDate) / (1000 * 60 * 60 * 24);

  const longevityScore = Math.min(accountAgeDays / 30, 50);

  const finalScore = Math.round(
    skillScore +
      githubScore +
      activityBonus +
      contentScore +
      projectScore +
      endorsementScore +
      longevityScore,
  );

  // Final safety check: if everything fails, return 0 instead of crashing the DB
  return isNaN(finalScore) ? 0 : finalScore;
}

/**
 * Get detailed breakdown of reputation sources
 */
export function getReputationBreakdown({
  skillsCount = 0,
  githubStats = {},
  joinedAt,
  postsCount = 0,
  totalLikes = 0,
  projectsCount = 0,
  endorsementsCount = 0,
}) {
  const skills = skillsCount || 0;
  const repos = githubStats.publicRepos || 0;
  const followers = githubStats.followers || 0;
  const stars = githubStats.totalStars || 0;
  const commits = githubStats.totalCommits || 0;
  const commits30d = githubStats.commits30d || githubStats.commits_30d || 0;
  const isActive = githubStats.isActive || githubStats.is_active || false;

  const skillScore = skills * 10;
  const githubScore = repos * 5 + followers * 3 + stars * 2 + commits * 0.1;
  const activityBonus = isActive ? commits30d * 2 : 0;
  const postsScore = postsCount * 15;
  const likesScore = totalLikes * 3;
  const projectScore = projectsCount * 20;
  const endorsementScore = endorsementsCount * 25;

  const joinDate = new Date(joinedAt).getTime();
  const accountAgeDays = isNaN(joinDate)
    ? 0
    : (Date.now() - joinDate) / (1000 * 60 * 60 * 24);
  const longevityScore = Math.min(accountAgeDays / 30, 50);

  return {
    total: calculateReputation({
      skillsCount,
      githubStats,
      joinedAt,
      postsCount,
      totalLikes,
      projectsCount,
      endorsementsCount,
    }),
    breakdown: {
      skills: Math.round(skillScore),
      github: Math.round(githubScore),
      activity: Math.round(activityBonus),
      posts: Math.round(postsScore),
      engagement: Math.round(likesScore),
      projects: Math.round(projectScore),
      endorsements: Math.round(endorsementScore),
      longevity: Math.round(longevityScore),
    },
    counts: {
      skills: skillsCount,
      repos,
      followers,
      stars,
      commits30d,
      posts: postsCount,
      likes: totalLikes,
      projects: projectsCount,
      endorsements: endorsementsCount,
    },
  };
}
