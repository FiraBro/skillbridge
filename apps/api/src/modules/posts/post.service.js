import { pool } from "../../config/db.js";
import { sanitizeMarkdown } from "../utils/sanitize.js";
import { generateUniqueSlug } from "../utils/slug.js";

// CREATE POST
export async function createPost(data, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const slug = await generateUniqueSlug(data.title);
    const sanitizedHtml = sanitizeMarkdown(data.markdown);

    // Insert post
    const { rows } = await client.query(
      `INSERT INTO posts(author_id, title, slug, markdown, sanitized_html)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [userId, data.title, slug, data.markdown, sanitizedHtml],
    );

    const post = rows[0];

    // Insert tags
    for (const tag of data.tags || []) {
      const tagRes = await client.query(
        `INSERT INTO tags(name) VALUES($1)
         ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [tag],
      );

      await client.query(
        `INSERT INTO post_tags(post_id, tag_id)
         VALUES($1, $2) ON CONFLICT DO NOTHING`,
        [post.id, tagRes.rows[0].id],
      );
    }

    await client.query("COMMIT");
    return post;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// LIST POSTS with pagination and optional tag filter
export async function listPosts({ page = 1, limit = 10, tag }) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      p.id, p.author_id, u.name AS author_name, p.title, p.slug,
      p.markdown, p.sanitized_html, p.views, p.created_at, p.updated_at,
      COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${tag ? "WHERE t.name = $3" : ""}
    GROUP BY p.id, u.name
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const values = tag ? [limit, offset, tag] : [limit, offset];

  const { rows } = await pool.query(query, values);
  return rows;
}

// GET SINGLE POST BY SLUG
export async function getPost(slug) {
  const { rows } = await pool.query(
    `
    SELECT 
      p.id, p.author_id, u.name AS author_name, p.title, p.slug,
      p.markdown, p.sanitized_html, p.views, p.created_at, p.updated_at,
      COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug=$1
    GROUP BY p.id, u.name
    `,
    [slug],
  );

  return rows[0];
}

// UPDATE POST
export async function updatePost(id, data) {
  if (!Object.keys(data).length) return;

  const fields = [];
  const values = [];
  let i = 1;

  if (data.title) (fields.push(`title=$${i++}`), values.push(data.title));
  if (data.markdown) {
    fields.push(`markdown=$${i++}`);
    fields.push(`sanitized_html=$${i++}`);
    values.push(data.markdown, sanitizeMarkdown(data.markdown));
  }

  if (!fields.length) return;

  await pool.query(
    `UPDATE posts SET ${fields.join(",")}, updated_at=now()
     WHERE id=$${i}`,
    [...values, id],
  );

  // Optional: update tags
  if (data.tags) {
    await pool.query(`DELETE FROM post_tags WHERE post_id=$1`, [id]);

    for (const tag of data.tags) {
      const tagRes = await pool.query(
        `INSERT INTO tags(name) VALUES($1)
         ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [tag],
      );

      await pool.query(
        `INSERT INTO post_tags(post_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [id, tagRes.rows[0].id],
      );
    }
  }
}
// ------------------ LIKES ------------------
export async function likePost(postId, userId) {
  await pool.query(
    `INSERT INTO post_likes(post_id, user_id)
     VALUES($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING`,
    [postId, userId],
  );

  const { rows } = await pool.query(
    `SELECT COUNT(*) AS likes_count FROM post_likes WHERE post_id=$1`,
    [postId],
  );

  return { likesCount: parseInt(rows[0].likes_count) };
}

export async function unlikePost(postId, userId) {
  await pool.query(`DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2`, [
    postId,
    userId,
  ]);

  const { rows } = await pool.query(
    `SELECT COUNT(*) AS likes_count FROM post_likes WHERE post_id=$1`,
    [postId],
  );

  return { likesCount: parseInt(rows[0].likes_count) };
}

// ------------------ COMMENTS ------------------
export async function addComment(postId, userId, text) {
  const { rows } = await pool.query(
    `INSERT INTO post_comments(post_id, user_id, text)
     VALUES($1, $2, $3) RETURNING *`,
    [postId, userId, text],
  );

  return rows[0];
}

export async function deleteComment(commentId, userId) {
  const { rows } = await pool.query(
    `DELETE FROM post_comments WHERE id=$1 AND user_id=$2 RETURNING *`,
    [commentId, userId],
  );

  if (rows.length === 0) throw new Error("Comment not found or not authorized");

  return rows[0];
}

export async function getComments(postId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.text, c.created_at, u.name AS username
     FROM post_comments c
     JOIN users u ON u.id=c.user_id
     WHERE c.post_id=$1
     ORDER BY c.created_at ASC`,
    [postId],
  );
  return rows;
}

// DELETE POST
export async function deletePost(id) {
  await pool.query(`DELETE FROM posts WHERE id=$1`, [id]);
}
