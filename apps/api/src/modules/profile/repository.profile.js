import { query } from "../../config/db.js";

// Add this to your existing exports in repository.profile.js

export async function createProfile({
  userId,
  username,
  fullName,
  githubUsername = null,
}) {
  const { rows } = await query(
    `
    INSERT INTO profiles (user_id, username, full_name, github_username)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userId, username, fullName, githubUsername],
  );
  return rows[0];
}

export async function getProfileByUsername(username) {
  const { rows } = await query(
    `
    SELECT 
      p.id, p.user_id, p.username, p.full_name, p.bio, p.location, p.reputation_score, p.joined_at, p.updated_at,
      -- FIX: Check profile first, then stats, then the main users table
      COALESCE(p.github_username, gs.github_username, u.github_username) AS github_username,
      (
        SELECT COALESCE(json_agg(s.name), '[]')
        FROM profile_skills ps
        JOIN skills s ON s.id = ps.skill_id
        WHERE ps.profile_id = p.id
      ) AS skills,
      gs.public_repos, gs.followers, gs.total_stars, gs.total_commits,
      gs.commits_30d, gs.is_active, gs.last_activity, gs.account_created, gs.last_synced_at
    FROM profiles p
    JOIN users u ON u.id = p.user_id  -- Join users to get their linked github account
    LEFT JOIN github_stats gs ON gs.profile_id = p.id
    WHERE p.username = $1
    `,
    [username],
  );
  return rows[0];
}

export async function updateProfileGithubName(profileId, githubName) {
  await query(`UPDATE profiles SET github_username = $1 WHERE id = $2`, [
    githubName,
    profileId,
  ]);
}

export async function upsertGithubStats(profileId, stats) {
  await query(
    `
    INSERT INTO github_stats 
      (profile_id, github_username, public_repos, followers, total_stars, total_commits, commits_30d, is_active, last_activity, account_created, last_synced_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (profile_id)
    DO UPDATE SET
      github_username = EXCLUDED.github_username,
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
      stats.github_username || stats.username,
      stats.public_repos || 0,
      stats.followers || 0,
      stats.total_stars || 0,
      stats.total_commits || 0,
      stats.commits_30d || 0,
      stats.is_active || false,
      stats.last_activity || null,
      stats.account_created || null,
    ],
  );
}

export async function updateReputation(profileId, score) {
  await query(
    `UPDATE profiles SET reputation_score = $1, updated_at = NOW() WHERE id = $2`,
    [score, profileId],
  );
}
