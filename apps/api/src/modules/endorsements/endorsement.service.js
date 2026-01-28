import { query } from "../../config/db.js";
import * as reputationService from "../reputation/reputation.service.js";

/**
 * Create a new endorsement
 */
export async function createEndorsement(
  endorserId,
  endorsedId,
  skillId,
  message = null,
) {
  // Prevent self-endorsement (also enforced by DB constraint)
  if (endorserId === endorsedId) {
    throw new Error("Cannot endorse yourself");
  }

  const { rows } = await query(
    `
    INSERT INTO endorsements 
      (endorser_id, endorsed_id, skill_id, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [endorserId, endorsedId, skillId, message],
  );

  // Trigger reputation recalculation
  await reputationService.recalculateUserReputation(endorsedId);

  return rows[0];
}

/**
 * Get endorsements for a user
 */
export async function getUserEndorsements(userId) {
  const { rows } = await query(
    `
    SELECT 
      e.*,
      u.name as endorser_name,
      u.avatar_url as endorser_avatar,
      s.name as skill_name
    FROM endorsements e
    JOIN users u ON u.id = e.endorser_id
    LEFT JOIN skills s ON s.id = e.skill_id
    WHERE e.endorsed_id = $1
    ORDER BY e.created_at DESC
    `,
    [userId],
  );

  return rows;
}

/**
 * Get endorsements grouped by skill
 */
export async function getUserEndorsementsBySkill(userId) {
  const { rows } = await query(
    `
    SELECT 
      s.id as skill_id,
      s.name as skill_name,
      COUNT(e.id) as endorsement_count,
      json_agg(
        json_build_object(
          'id', e.id,
          'endorser_id', e.endorser_id,
          'endorser_name', u.name,
          'endorser_avatar', u.avatar_url,
          'message', e.message,
          'created_at', e.created_at
        ) ORDER BY e.created_at DESC
      ) as endorsements
    FROM endorsements e
    JOIN users u ON u.id = e.endorser_id
    JOIN skills s ON s.id = e.skill_id
    WHERE e.endorsed_id = $1
    GROUP BY s.id, s.name
    ORDER BY endorsement_count DESC, s.name
    `,
    [userId],
  );

  return rows;
}

/**
 * Delete an endorsement
 */
export async function deleteEndorsement(endorsementId, userId) {
  // Get the endorsement first to check ownership and get endorsed_id
  const { rows: endorsementRows } = await query(
    `SELECT * FROM endorsements WHERE id = $1`,
    [endorsementId],
  );

  if (endorsementRows.length === 0) {
    throw new Error("Endorsement not found");
  }

  const endorsement = endorsementRows[0];

  // Only the endorser can delete their endorsement
  if (endorsement.endorser_id !== userId) {
    throw new Error("Unauthorized to delete this endorsement");
  }

  await query(`DELETE FROM endorsements WHERE id = $1`, [endorsementId]);

  // Trigger reputation recalculation for the endorsed user
  await reputationService.recalculateUserReputation(endorsement.endorsed_id);

  return true;
}

/**
 * Check if user has endorsed another user for a skill
 */
export async function hasEndorsed(endorserId, endorsedId, skillId) {
  const { rows } = await query(
    `
    SELECT EXISTS(
      SELECT 1 FROM endorsements 
      WHERE endorser_id = $1 AND endorsed_id = $2 AND skill_id = $3
    ) as has_endorsed
    `,
    [endorserId, endorsedId, skillId],
  );

  return rows[0].has_endorsed;
}
