import { query } from "../../config/db.js";

/**
 * Global search across developers and jobs
 */
export async function globalSearch(searchQuery, filters = {}) {
  const { type = "all", skills = [], minReputation = 0 } = filters;
  const results = {
    developers: [],
    jobs: [],
  };

  const term = `%${searchQuery}%`;

  // 1. Search Developers
  if (type === "all" || type === "developers") {
    let devSql = `
      SELECT u.id, u.name, u.avatar_url, p.id as profile_id, p.reputation_score, p.bio,
             ARRAY(SELECT ps.name FROM profile_skills ps WHERE ps.profile_id = p.id) as skills
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE (u.name ILIKE $1 OR p.bio ILIKE $1)
    `;
    const devParams = [term];

    if (minReputation > 0) {
      devParams.push(minReputation);
      devSql += ` AND p.reputation_score >= $${devParams.length}`;
    }

    if (skills.length > 0) {
      devParams.push(skills);
      devSql += ` AND EXISTS (
        SELECT 1 FROM profile_skills ps 
        WHERE ps.profile_id = p.id AND ps.name = ANY($${devParams.length})
      )`;
    }

    devSql += ` ORDER BY p.reputation_score DESC LIMIT 20`;
    const { rows: devs } = await query(devSql, devParams);
    results.developers = devs;
  }

  // 2. Search Jobs
  if (type === "all" || type === "jobs") {
    let jobSql = `
      SELECT j.*, u.name as client_name 
      FROM jobs j
      JOIN users u ON u.id = j.client_id
      WHERE (j.title ILIKE $1 OR j.description ILIKE $1)
      AND j.status = 'open'
      AND j.is_published = true
    `;
    const jobParams = [term];

    if (skills.length > 0) {
      jobParams.push(skills);
      jobSql += ` AND j.required_skills ?| $${jobParams.length}`;
    }

    jobSql += ` ORDER BY j.created_at DESC LIMIT 20`;
    const { rows: jobs } = await query(jobSql, jobParams);
    results.jobs = jobs;
  }

  return results;
}

/**
 * Get popular/trending skills for filtering
 */
export async function getTrendingSkills() {
  const { rows } = await query(`
    SELECT name, COUNT(*) as count 
    FROM profile_skills 
    GROUP BY name 
    ORDER BY count DESC 
    LIMIT 10
  `);
  return rows;
}
