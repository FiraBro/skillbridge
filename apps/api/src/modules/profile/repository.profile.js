import { query } from "../../config/db.js";

export async function createProfile(data) {
  // Fix: Ensure we fall back to user_id if userId is undefined
  const userId = data.userId || data.user_id;

  const { rows } = await query(
    `
    INSERT INTO profiles 
      (user_id, username, full_name, bio, location, github_username)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      userId,
      data.username,
      data.fullName || data.full_name, // Handle both camelCase and snake_case
      data.bio,
      data.location,
      data.githubUsername || data.github_username,
    ],
  );
  return rows[0];
}

export async function getProfileByUsername(username) {
  const { rows } = await query(
    `
    SELECT p.*, 
           -- Use FILTER to avoid [null] if no skills exist
           COALESCE(json_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills,
           gs.public_repos, 
           gs.followers, 
           gs.total_stars, 
           gs.total_commits,
           gs.last_synced_at
    FROM profiles p
    LEFT JOIN profile_skills ps ON ps.profile_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    LEFT JOIN github_stats gs ON gs.profile_id = p.id
    WHERE p.username = $1
    GROUP BY p.id, gs.profile_id
    `,
    [username],
  );
  return rows[0];
}

export async function upsertGithubStats(profileId, stats) {
  await query(
    `
    INSERT INTO github_stats 
      (profile_id, public_repos, followers, total_stars, total_commits, last_synced_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (profile_id)
    DO UPDATE SET
      public_repos = EXCLUDED.public_repos,
      followers = EXCLUDED.followers,
      total_stars = EXCLUDED.total_stars,
      total_commits = EXCLUDED.total_commits,
      last_synced_at = NOW()
    `,
    [
      profileId,
      stats.publicRepos || stats.public_repos,
      stats.followers,
      stats.totalStars || stats.total_stars,
      stats.totalCommits || stats.total_commits,
    ],
  );
}

export async function updateReputation(profileId, score) {
  await query(
    `UPDATE profiles SET reputation_score = $1, updated_at = NOW() WHERE id = $2`,
    [score, profileId],
  );
}
