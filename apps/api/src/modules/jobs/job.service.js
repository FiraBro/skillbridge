import { query } from "../../config/db.js";
import ApiError from "../utils/apiError.js";
import { emailQueue } from "../../queues/email.queue.js";

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
    throw new ApiError(400, "Already applied to this job");
  }

  const application = rows[0];

  // Notify the job owner (client/company) via email queue
  try {
    const { rows: clientRows } = await query(
      `SELECT u.email as client_email, u.name as client_name, j.title as job_title
       FROM jobs j JOIN users u ON u.id = j.client_id WHERE j.id = $1`,
      [jobId],
    );

    if (clientRows && clientRows[0] && clientRows[0].client_email) {
      // Get applicant name
      const { rows: devRows } = await query(
        `SELECT name as dev_name FROM users WHERE id = $1`,
        [developerId],
      );

      await emailQueue.add("send-job-application-notification", {
        to: clientRows[0].client_email,
        clientName: clientRows[0].client_name,
        applicantName: devRows[0]?.dev_name || "A developer",
        jobTitle: clientRows[0].job_title,
      });
    }
  } catch (e) {
    console.error("Failed to queue job application notification:", e.message);
  }

  return application;
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
  if (rows.length === 0)
    throw new ApiError(404, "Job not found or unauthorized");
  return rows[0];
}

/**
 * Update hiring status and private notes for an application
 */
export async function updateApplicationFeedback(applicationId, clientId, data) {
  const { status, notes } = data;

  try {
    // 1. Log the incoming request to your BACKEND terminal to debug
    console.log(`Updating App: ${applicationId} for Client: ${clientId}`);

    // 2. Execute the update
    // Note: We use "status" as the column name here.
    // IF YOUR DB COLUMN IS 'hiring_status', CHANGE 'status =' TO 'hiring_status =' below.
    const updateQuery = `
      UPDATE job_applications
      SET 
        hiring_status = COALESCE($1, hiring_status),
        private_notes = COALESCE($2, private_notes),
        updated_at = NOW()
      WHERE id = $3 
      AND job_id IN (SELECT id FROM jobs WHERE client_id = $4)
      RETURNING *
    `;

    const { rows } = await query(updateQuery, [
      status,
      notes,
      applicationId,
      clientId,
    ]);

    if (rows.length === 0) {
      throw new ApiError(404, "Application not found or unauthorized");
    }

    const updated = rows[0];

    // 3. CRITICAL FIX: Wrap the notification in a way that CANNOT crash the request
    // We don't 'await' this so the user gets their response even if Redis/Email fails
    if (status) {
      (async () => {
        try {
          const { rows: info } = await query(
            `SELECT u.email, u.name as dev_name, j.title FROM job_applications ja
             JOIN users u ON u.id = ja.developer_id
             JOIN jobs j ON j.id = ja.job_id
             WHERE ja.id = $1`,
            [applicationId],
          );

          if (info?.[0]?.email && emailQueue) {
            await emailQueue.add("send-application-status-notification", {
              to: info[0].email,
              status,
              jobTitle: info[0].title,
            });
          }
        } catch (err) {
          console.error(
            "Background Notification Failed (Non-Fatal):",
            err.message,
          );
        }
      })();
    }

    return updated;
  } catch (error) {
    // THIS WILL LOG THE REAL ERROR TO YOUR BACKEND CONSOLE
    console.error("--- DETAILED BACKEND ERROR ---");
    console.error(error);
    console.error("------------------------------");

    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Internal Server Error: ${error.message}`);
  }
}

// Helper to keep the main function clean
async function handleStatusNotification(applicationId, status) {
  const { rows: info } = await query(
    `SELECT u.email, u.name as dev_name, j.title, c.name as company_name
     FROM job_applications ja
     JOIN users u ON u.id = ja.developer_id
     JOIN jobs j ON j.id = ja.job_id
     JOIN users c ON c.id = j.client_id
     WHERE ja.id = $1`,
    [applicationId],
  );

  if (info?.[0]?.email) {
    await emailQueue.add("send-application-status-notification", {
      to: info[0].email,
      applicantName: info[0].dev_name,
      status,
      jobTitle: info[0].title,
      companyName: info[0].company_name,
    });
  }
}
/**
 * Get applicants for a specific job — only visible to the job owner (client)
 */
export async function getJobApplicants(jobId, clientId) {
  // Verify ownership
  const { rows: owner } = await query(
    `SELECT 1 FROM jobs WHERE id = $1 AND client_id = $2`,
    [jobId, clientId],
  );

  if (!owner || owner.length === 0)
    throw new ApiError(404, "Job not found or unauthorized");

  const { rows } = await query(
    `
    SELECT ja.*, u.id as developer_id, u.name as developer_name, u.email as developer_email,
           pr.id as profile_id, pr.username, pr.reputation_score, u.avatar_url
    FROM job_applications ja
    JOIN users u ON u.id = ja.developer_id
    LEFT JOIN profiles pr ON pr.user_id = u.id
    WHERE ja.job_id = $1
    ORDER BY ja.applied_at DESC
    `,
    [jobId],
  );

  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    hiring_status: r.hiring_status || r.status,
    private_notes: r.private_notes,
    applied_at: r.applied_at,
    developer: {
      id: r.developer_id,
      name: r.developer_name,
      email: r.developer_email,
      profile_id: r.profile_id,
      username: r.username,
      reputation: r.reputation_score,
      avatar_url: r.avatar_url,
    },
  }));
}

/**
 * Get all jobs posted by a specific company
 */
export async function getCompanyJobs(clientId) {
  const { rows } = await query(
    `
    SELECT j.*,
      (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count,
      (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id AND hiring_status = 'hired') as hired_count
    FROM jobs j
    WHERE j.client_id = $1
    ORDER BY j.created_at DESC
    `,
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
