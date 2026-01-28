import { query } from "../../config/db.js";

/**
 * Create a report for content
 */
export async function reportContent(reporterId, data) {
  const { contentType, contentId, reason } = data;
  const { rows } = await query(
    `
    INSERT INTO content_reports (reporter_id, content_type, content_id, reason)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [reporterId, contentType, contentId, reason],
  );
  return rows[0];
}

/**
 * Get all reports (Admin only)
 */
export async function getReports(status = "pending") {
  const { rows } = await query(
    `
    SELECT r.*, u.name as reporter_name
    FROM content_reports r
    LEFT JOIN users u ON u.id = r.reporter_id
    WHERE r.status = $1
    ORDER BY r.created_at DESC
    `,
    [status],
  );
  return rows;
}

/**
 * Resolve a report (Admin only)
 */
export async function resolveReport(reportId, action, adminNotes) {
  const status = action === "dismiss" ? "dismissed" : "resolved";

  const { rows } = await query(
    `
    UPDATE content_reports
    SET status = $1, admin_notes = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
    `,
    [status, adminNotes, reportId],
  );

  const report = rows[0];

  if (action === "delete") {
    // Perform actual deletion based on content type
    const tables = {
      post: "posts",
      project: "projects",
      job: "jobs",
      developer: "users", // Be careful with user deletion
    };

    const table = tables[report.content_type];
    if (table) {
      await query(`DELETE FROM ${table} WHERE id = $1`, [report.content_id]);
    }
  }

  return report;
}

/**
 * Update platform settings (Admin only)
 */
export async function updateSettings(key, value) {
  const { rows } = await query(
    `
    INSERT INTO platform_settings (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    RETURNING *
    `,
    [key, JSON.stringify(value)],
  );
  return rows[0];
}

/**
 * Get platform settings
 */
export async function getSettings(key) {
  const { rows } = await query(
    `SELECT * FROM platform_settings WHERE key = $1`,
    [key],
  );
  return rows[0]?.value;
}

/**
 * Get platform overview stats (Admin only)
 */
export async function getPlatformStats() {
  const stats = {};

  const tables = ["users", "posts", "projects", "jobs", "job_applications"];

  await Promise.all(
    tables.map(async (table) => {
      const { rows } = await query(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = parseInt(rows[0].count);
    }),
  );

  // Recent activity
  const { rows: recentUsers } = await query(
    `SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'`,
  );
  stats.new_users_7d = parseInt(recentUsers[0].count);

  return stats;
}
