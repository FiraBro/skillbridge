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
           gs.commits_30d,
           gs.is_active,
           gs.last_activity,
           gs.account_created,
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
      (profile_id, public_repos, followers, total_stars, total_commits, commits_30d, is_active, last_activity, account_created, last_synced_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (profile_id)
    DO UPDATE SET
      public_repos = EXCLUDED.public_repos,
      followers = EXCLUDED.followers,
      total_stars = EXCLUDED.total_stars,
      total_commits = EXCLUDED.total_commits,
      commits_30d = EXCLUDED.commits_30d,
      is_active = EXCLUDED.is_active,
      last_activity = EXCLUDED.last_activity,
      account_created = EXCLUDED.account_created,
      last_synced_at = NOW()
    `,
    [
      profileId,
      stats.publicRepos || stats.public_repos,
      stats.followers,
      stats.totalStars || stats.total_stars,
      stats.totalCommits || stats.total_commits,
      stats.commits30d || stats.commits_30d || 0,
      stats.isActive || stats.is_active || false,
      stats.lastActivity || stats.last_activity || null,
      stats.accountCreated || stats.account_created || null,
    ],
  );
}

export async function updateReputation(profileId, score) {
  await query(
    `UPDATE profiles SET reputation_score = $1, updated_at = NOW() WHERE id = $2`,
    [score, profileId],
  );
}
