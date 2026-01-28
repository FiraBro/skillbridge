export function calculateReputation(
  {
    skillsCount = 0,
    githubStats = {},
    joinedAt,
    postsCount = 0,
    totalLikes = 0,
    projectsCount = 0,
    endorsementsCount = 0,
  },
  weights = null,
) {
  // Default weights if none provided from DB
  const w = weights || {
    skill: 10,
    repo: 5,
    follower: 3,
    star: 2,
    commit: 0.1,
    commit_30d: 2,
    post: 15,
    like: 3,
    project: 20,
    endorsement: 25,
    longevity_max: 50,
  };

  const skills = skillsCount || 0;
  const repos = githubStats.publicRepos || 0;
  const followers = githubStats.followers || 0;
  const stars = githubStats.totalStars || 0;
  const commits = githubStats.totalCommits || 0;
  const commits30d = githubStats.commits30d || githubStats.commits_30d || 0;
  const isActive = githubStats.isActive || githubStats.is_active || false;

  const skillScore = skills * (w.skill || 10);
  const githubScore =
    repos * (w.repo || 5) +
    followers * (w.follower || 3) +
    stars * (w.star || 2) +
    commits * (w.commit || 0.1);
  const activityBonus = isActive ? commits30d * (w.commit_30d || 2) : 0;
  const contentScore = postsCount * (w.post || 15) + totalLikes * (w.like || 3);
  const projectScore = projectsCount * (w.project || 20);
  const endorsementScore = endorsementsCount * (w.endorsement || 25);

  const joinDate = new Date(joinedAt).getTime();
  const accountAgeDays = isNaN(joinDate)
    ? 0
    : (Date.now() - joinDate) / (1000 * 60 * 60 * 24);
  const longevityScore = Math.min(accountAgeDays / 30, w.longevity_max || 50);

  const finalScore = Math.round(
    skillScore +
      githubScore +
      activityBonus +
      contentScore +
      projectScore +
      endorsementScore +
      longevityScore,
  );

  return isNaN(finalScore) ? 0 : finalScore;
}

/**
 * Get detailed breakdown of reputation sources
 */
export function getReputationBreakdown(
  {
    skillsCount = 0,
    githubStats = {},
    joinedAt,
    postsCount = 0,
    totalLikes = 0,
    projectsCount = 0,
    endorsementsCount = 0,
  },
  weights = null,
) {
  const w = weights || {
    skill: 10,
    repo: 5,
    follower: 3,
    star: 2,
    commit: 0.1,
    commit_30d: 2,
    post: 15,
    like: 3,
    project: 20,
    endorsement: 25,
    longevity_max: 50,
  };

  const skills = skillsCount || 0;
  const repos = githubStats.publicRepos || 0;
  const followers = githubStats.followers || 0;
  const stars = githubStats.totalStars || 0;
  const commits = githubStats.totalCommits || 0;
  const commits30d = githubStats.commits30d || githubStats.commits_30d || 0;
  const isActive = githubStats.isActive || githubStats.is_active || false;

  const skillScore = skills * (w.skill || 10);
  const githubScore =
    repos * (w.repo || 5) +
    followers * (w.follower || 3) +
    stars * (w.star || 2) +
    commits * (w.commit || 0.1);
  const activityBonus = isActive ? commits30d * (w.commit_30d || 2) : 0;
  const postsScore = postsCount * (w.post || 15);
  const likesScore = totalLikes * (w.like || 3);
  const projectScore = projectsCount * (w.project || 20);
  const endorsementScore = endorsementsCount * (w.endorsement || 25);

  const joinDate = new Date(joinedAt).getTime();
  const accountAgeDays = isNaN(joinDate)
    ? 0
    : (Date.now() - joinDate) / (1000 * 60 * 60 * 24);
  const longevityScore = Math.min(accountAgeDays / 30, w.longevity_max || 50);

  return {
    total: calculateReputation(
      {
        skillsCount,
        githubStats,
        joinedAt,
        postsCount,
        totalLikes,
        projectsCount,
        endorsementsCount,
      },
      w,
    ),
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
