import { z } from "zod";
import { pool } from "../../config/db.js";
export const createProjectSchema = z.object({
  title: z.string().min(3).max(100),
  githubRepo: z.string().url(),
  liveDemo: z.string().url().optional().nullable(),
  techStack: z.array(z.string()),
  description: z.string().min(10),
  thumbnail: z.string().url().optional().nullable(),
});

export const ProjectModel = {
  create(project) {
    return pool.query(
      `INSERT INTO projects
      (user_id, title, github_repo, live_demo, tech_stack, description, description_html, thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        project.userId,
        project.title,
        project.githubRepo,
        project.liveDemo,
        project.techStack,
        project.description,
        project.descriptionHtml,
        project.thumbnail,
      ],
    );
  },

  findPublic({ tech, limit, offset }) {
    let query = `
      SELECT p.*, u.name, split_part(p.github_repo, '/', 4) as github_username
      FROM projects p
      JOIN users u ON u.id = p.user_id
      WHERE p.visibility='public'
    `;
    const params = [];

    if (tech) {
      params.push(tech);
      query += ` AND $${params.length} = ANY(p.tech_stack)`;
    }

    params.push(limit, offset);
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    return pool.query(query, params);
  },

  findById(id) {
    return pool.query(
      `SELECT p.*, u.name, split_part(p.github_repo, '/', 4) as github_username
       FROM projects p
       JOIN users u ON u.id = p.user_id
       WHERE p.id=$1`,
      [id],
    );
  },

  update(id, userId, data) {
    return pool.query(
      `UPDATE projects SET
       title=$1, live_demo=$2, tech_stack=$3, description=$4,
       description_html=$5, thumbnail=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=$8
       RETURNING *`,
      [
        data.title,
        data.liveDemo,
        data.techStack,
        data.description,
        data.descriptionHtml,
        data.thumbnail,
        id,
        userId,
      ],
    );
  },

  delete(id, userId) {
    return pool.query(`DELETE FROM projects WHERE id=$1 AND user_id=$2`, [
      id,
      userId,
    ]);
  },
};
