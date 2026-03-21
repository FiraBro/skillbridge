// admin.repository.js
import { pool } from "../../config/db.js";

/* ================= COUNTS ================= */

export const countUsers = async () => {
  const { rows } = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE role='developer') AS developers,
      COUNT(*) FILTER (WHERE role='company') AS companies
     FROM users`,
  );
  return rows[0];
};

export const countPosts = async () => {
  const { rows } = await pool.query(`SELECT COUNT(*) FROM posts`);
  return Number(rows[0].count);
};

export const countProjects = async () => {
  const { rows } = await pool.query(`SELECT COUNT(*) FROM projects`);
  return Number(rows[0].count);
};

export const countJobs = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM jobs WHERE is_published=true`,
  );
  return Number(rows[0].count);
};

export const countOpenReports = async () => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM reports WHERE status='open'`,
  );
  return Number(rows[0].count);
};

export const findUsers = async ({ page = 1, limit = 20, role, search }) => {
  const offset = (page - 1) * limit;

  const values = [];
  let where = [];

  if (role) {
    values.push(role);
    where.push(`role = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    where.push(`name ILIKE $${values.length}`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const query = `
    SELECT id, name, email, role, is_suspended, created_at
    FROM users
    ${whereSQL}
    ORDER BY created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const toggleSuspend = async (userId) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET is_suspended = NOT is_suspended
    WHERE id=$1
    RETURNING id, is_suspended
    `,
    [userId],
  );

  return rows[0];
};

export const getReports = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `
    SELECT r.*, u.name AS reporter_name
    FROM reports r
    JOIN users u ON u.id = r.reporter_id
    ORDER BY r.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return rows;
};
export const getActivity = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `
    SELECT *
    FROM activities
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  return rows;
};
export const resolveReport = async (id) => {
  const { rows } = await pool.query(
    `
    UPDATE reports
    SET status='resolved'
    WHERE id=$1
    RETURNING *
    `,
    [id],
  );

  return rows[0];
};

export const checkDB = async () => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};
