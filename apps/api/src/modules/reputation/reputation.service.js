import { query } from "../../config/db.js";
import {
  calculateReputation,
  getReputationBreakdown,
} from "../services/reputation.engine.js";

/**
 * Get detailed reputation breakdown for a user
 */
export async function getUserReputationBreakdown(userId) {
  const { rows } = await query(
    `
    SELECT 
      p.id as profile_id,
      p.user_id,
      p.reputation_score,
      p.joined_at,
      -- Count skills
      COUNT(DISTINCT ps.skill_id) as skills_count,
      -- GitHub stats
      gs.public_repos,
      gs.followers,
      gs.total_stars,
      gs.total_commits,
      gs.commits_30d,
      gs.is_active,
      -- Posts and engagement
      COUNT(DISTINCT posts.id) as posts_count,
      COALESCE(SUM(posts.like_count), 0) as total_likes,
      -- Projects
      COUNT(DISTINCT proj.id) as projects_count,
      -- Endorsements
      COUNT(DISTINCT e.id) as endorsements_count
    FROM profiles p
    LEFT JOIN profile_skills ps ON ps.profile_id = p.id
    LEFT JOIN github_stats gs ON gs.profile_id = p.id
    LEFT JOIN posts ON posts.author_id = p.user_id
    LEFT JOIN projects proj ON proj.user_id = p.user_id
    LEFT JOIN endorsements e ON e.endorsed_id = p.user_id
    WHERE p.user_id = $1
    GROUP BY p.id, gs.profile_id
    `,
    [userId],
  );

  if (!rows[0]) {
    return null;
  }

  const data = rows[0];

  return getReputationBreakdown({
    skillsCount: parseInt(data.skills_count) || 0,
    githubStats: {
      publicRepos: data.public_repos,
      followers: data.followers,
      totalStars: data.total_stars,
      totalCommits: data.total_commits,
      commits_30d: data.commits_30d,
      is_active: data.is_active,
    },
    joinedAt: data.joined_at,
    postsCount: parseInt(data.posts_count) || 0,
    totalLikes: parseInt(data.total_likes) || 0,
    projectsCount: parseInt(data.projects_count) || 0,
    endorsementsCount: parseInt(data.endorsements_count) || 0,
  });
}

/**
 * Get reputation history for a user
 */
export async function getUserReputationHistory(userId, limit = 50) {
  const { rows } = await query(
    `
    SELECT 
      rh.*,
      u.name as user_name,
      u.avatar_url
    FROM reputation_history rh
    JOIN users u ON u.id = rh.user_id
    WHERE rh.user_id = $1
    ORDER BY rh.created_at DESC
    LIMIT $2
    `,
    [userId, limit],
  );

  return rows;
}

/**
 * Record a reputation change in history
 */
export async function recordReputationChange(
  userId,
  previousScore,
  newScore,
  reason,
  metadata = {},
) {
  const changeAmount = newScore - previousScore;

  await query(
    `
    INSERT INTO reputation_history 
      (user_id, previous_score, new_score, change_amount, reason, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId, previousScore, newScore, changeAmount, reason, metadata],
  );
}

/**
 * Recalculate and update user reputation
 */
export async function recalculateUserReputation(userId) {
  // Get current reputation
  const { rows: currentRows } = await query(
    `SELECT reputation_score FROM profiles WHERE user_id = $1`,
    [userId],
  );

  const previousScore = currentRows[0]?.reputation_score || 0;

  // Get breakdown which includes new calculation
  const breakdown = await getUserReputationBreakdown(userId);

  if (!breakdown) {
    return null;
  }

  const newScore = breakdown.total;

  // Update reputation in profile
  await query(
    `UPDATE profiles SET reputation_score = $1, updated_at = NOW() WHERE user_id = $2`,
    [newScore, userId],
  );

  // Record the change if score changed
  if (newScore !== previousScore) {
    await recordReputationChange(
      userId,
      previousScore,
      newScore,
      "recalculation",
      { breakdown: breakdown.breakdown },
    );
  }

  return {
    previousScore,
    newScore,
    change: newScore - previousScore,
    breakdown,
  };
}
