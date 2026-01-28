import { query } from "../../config/db.js";

/**
 * Browse all open jobs with optional filters
 */
export async function browseJobs(filters = {}) {
  const { skills, search } = filters;
  let sql = `
    SELECT j.*, u.name as client_name 
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    WHERE j.status = 'open'
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`;
  }

  // Simplified skill filtering for now
  if (skills && skills.length > 0) {
    params.push(skills);
    sql += ` AND j.required_skills ?| $${params.length}`;
  }

  sql += ` ORDER BY j.created_at DESC`;

  const { rows } = await query(sql, params);
  return rows;
}

/**
 * Get recommended jobs for a user based on skill matching
 */
export async function getRecommendedJobs(userId) {
  // 1. Get user skills from profile
  const { rows: profileRows } = await query(
    `
    SELECT ps.name as skill_name
    FROM profiles p
    JOIN profile_skills ps ON ps.profile_id = p.id
    WHERE p.user_id = $1
    `,
    [userId],
  );

  const userSkills = profileRows.map((r) => r.skill_name);

  if (userSkills.length === 0) {
    return browseJobs(); // Return all if no skills defined
  }

  // 2. Fetch jobs and calculate match score
  // Note: For large scale, this should be done in SQL with pg_trgm or similar
  const { rows: jobs } = await query(
    `
    SELECT j.*, u.name as client_name
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    WHERE j.status = 'open'
    ORDER BY j.created_at DESC
    `,
  );

  const recommendedJobs = jobs.map((job) => {
    const requiredSkills = Array.isArray(job.required_skills)
      ? job.required_skills
      : [];
    const matchingSkills = requiredSkills.filter((s) => userSkills.includes(s));
    const matchPercentage =
      requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 0;

    return {
      ...job,
      matchPercentage,
      isRecommended: matchPercentage >= 70,
    };
  });

  // Sort by match percentage
  return recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Apply to a job with profile
 */
export async function applyToJob(jobId, developerId, message) {
  const { rows } = await query(
    `
    INSERT INTO job_applications (job_id, developer_id, message)
    VALUES ($1, $2, $3)
    ON CONFLICT (job_id, developer_id) DO NOTHING
    RETURNING *
    `,
    [jobId, developerId, message],
  );

  if (rows.length === 0) {
    throw new Error("Already applied to this job");
  }

  return rows[0];
}

/**
 * Create a new job post with enhanced fields
 */
export async function createJob(clientId, jobData) {
  const {
    title,
    description,
    budgetRange,
    requiredSkills,
    expectedOutcome,
    trialFriendly,
  } = jobData;

  const { rows } = await query(
    `
    INSERT INTO jobs (client_id, title, description, budget_range, required_skills, expected_outcome, trial_friendly)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      clientId,
      title,
      description,
      budgetRange,
      JSON.stringify(requiredSkills || []),
      expectedOutcome,
      trialFriendly || false,
    ],
  );
  return rows[0];
}

/**
 * Toggle job publishing status
 */
export async function toggleJobPublish(jobId, clientId, isPublished) {
  const { rows } = await query(
    `UPDATE jobs SET is_published = $1, updated_at = NOW() WHERE id = $2 AND client_id = $3 RETURNING *`,
    [isPublished, jobId, clientId],
  );
  return rows[0];
}

/**
 * Update hiring status and private notes for an application
 */
export async function updateApplicationFeedback(applicationId, clientId, data) {
  const { status, notes } = data;

  // Verify ownership (job must belong to the client)
  const { rows } = await query(
    `
    UPDATE job_applications ja
    SET hiring_status = COALESCE($1, hiring_status), 
        private_notes = COALESCE($2, private_notes), 
        updated_at = NOW()
    FROM jobs j
    WHERE ja.id = $3 AND ja.job_id = j.id AND j.client_id = $4
    RETURNING ja.*
    `,
    [status, notes, applicationId, clientId],
  );

  return rows[0];
}

/**
 * Get all jobs posted by a specific company
 */
export async function getCompanyJobs(clientId) {
  const { rows } = await query(
    `SELECT * FROM jobs WHERE client_id = $1 ORDER BY created_at DESC`,
    [clientId],
  );
  return rows;
}

/**
 * Get job details with application status for a specific user
 */
export async function getJobDetails(jobId, userId = null) {
  const { rows } = await query(
    `
    SELECT j.*, u.name as client_name,
           (SELECT status FROM job_applications WHERE job_id = j.id AND developer_id = $2) as application_status
    FROM jobs j
    JOIN users u ON u.id = j.client_id
    WHERE j.id = $1
    `,
    [jobId, userId],
  );
  return rows[0];
}
