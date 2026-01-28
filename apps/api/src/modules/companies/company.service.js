import { query } from "../../config/db.js";

/**
 * Get or create company profile
 */
export async function getCompanyProfile(userId) {
  const { rows } = await query(
    `SELECT * FROM company_profiles WHERE user_id = $1`,
    [userId],
  );
  return rows[0];
}

/**
 * Create or update company profile
 */
export async function upsertCompanyProfile(userId, profileData) {
  const { name, logo_url, description, industry, size, website } = profileData;

  const { rows } = await query(
    `
    INSERT INTO company_profiles (user_id, name, logo_url, description, industry, size, website)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      logo_url = EXCLUDED.logo_url,
      description = EXCLUDED.description,
      industry = EXCLUDED.industry,
      size = EXCLUDED.size,
      website = EXCLUDED.website,
      updated_at = NOW()
    RETURNING *
    `,
    [userId, name, logo_url, description, industry, size, website],
  );

  return rows[0];
}

/**
 * Bookmark a developer
 */
export async function bookmarkDeveloper(companyId, developerId) {
  const { rows } = await query(
    `
    INSERT INTO developer_bookmarks (company_id, developer_id)
    VALUES ($1, $2)
    ON CONFLICT (company_id, developer_id) DO NOTHING
    RETURNING *
    `,
    [companyId, developerId],
  );
  return rows[0];
}

/**
 * Remove bookmark
 */
export async function removeBookmark(companyId, developerId) {
  const { rowCount } = await query(
    `DELETE FROM developer_bookmarks WHERE company_id = $1 AND developer_id = $2`,
    [companyId, developerId],
  );
  return rowCount > 0;
}

/**
 * Get bookmarked developers
 */
export async function getBookmarks(companyId) {
  const { rows } = await query(
    `
    SELECT u.id, u.name, u.avatar_url, p.id as profile_id, p.reputation_score
    FROM developer_bookmarks db
    JOIN users u ON u.id = db.developer_id
    JOIN profiles p ON p.user_id = u.id
    WHERE db.company_id = $1
    `,
    [companyId],
  );
  return rows;
}

/**
 * Developer Discovery / Matching logic for companies
 * Suggests developers based on skill overlap and reputation
 */
export async function discoverDevelopers(filters = {}) {
  const { skills, minReputation, search } = filters;

  let sql = `
    SELECT u.id, u.name, u.avatar_url, p.id as profile_id, p.reputation_score, p.bio,
           ARRAY(SELECT name FROM profile_skills WHERE profile_id = p.id) as skills
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];

  if (minReputation) {
    params.push(minReputation);
    sql += ` AND p.reputation_score >= $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (u.name ILIKE $${params.length} OR p.bio ILIKE $${params.length})`;
  }

  // Filter by skills if provided
  if (skills && skills.length > 0) {
    params.push(skills);
    sql += ` AND EXISTS (
      SELECT 1 FROM profile_skills ps 
      WHERE ps.profile_id = p.id AND ps.name = ANY($${params.length})
    )`;
  }

  sql += ` ORDER BY p.reputation_score DESC LIMIT 50`;

  const { rows } = await query(sql, params);
  return rows;
}
