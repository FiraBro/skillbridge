import { pool } from "../../config/db.js";
import { sanitizeMarkdown, sanitizeHtml } from "../utils/sanitize.js";
import { generateUniqueSlug } from "../utils/slug.js";
import ApiError from "../utils/apiError.js";

// ---------------------- POSTS ----------------------
export async function createPost(data, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const slug = await generateUniqueSlug(data.title);
    const sanitizedHtml = sanitizeMarkdown(data.markdown);

    // Added cover_image to the INSERT statement
    const { rows } = await client.query(
      `INSERT INTO posts(author_id, title, slug, markdown, sanitized_html, cover_image)
       VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, data.title, slug, data.markdown, sanitizedHtml, data.coverImage],
    );
    const post = rows[0];

    // Insert tags logic remains the same
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
// ---------------------- POSTS ----------------------
export async function listPosts({ page = 1, limit = 10, tag, userId }) {
  const offset = (page - 1) * limit;

  const values = [limit, offset];
  let userIdIndex = null;
  let tagIndex = null;

  let whereClauses = ["p.deleted_at IS NULL", "pr.deleted_at IS NULL"];

  if (tag) {
    tagIndex = values.length + 1;
    values.push(tag);
    whereClauses.push(`t.name=$${tagIndex}`);
  }

  if (userId) {
    userIdIndex = values.length + 1;
    values.push(userId);
  }

  const query = `
    SELECT
      p.id,
      p.author_id,
      u.name AS author_name,
      pr.username AS author_username,
      p.title,
      p.slug,
      p.markdown,
      p.sanitized_html,
      p.views,
      p.created_at,
      p.updated_at,
      p.deleted_at AS post_deleted_at,
      pr.deleted_at AS profile_deleted_at,
      COALESCE(
        json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '[]'
      ) AS tags,
      (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) AS comments_count,
      p.shares_count
      ${userId ? `, EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id=$${userIdIndex}) AS is_liked` : ""}
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN profiles pr ON pr.user_id = u.id
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""}
    GROUP BY p.id, u.name, pr.username, pr.deleted_at
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2

  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

export async function getPost(slug, userId) {
  const values = [slug];
  let userIdIndex = null;

  if (userId) {
    userIdIndex = 2;
    values.push(userId);
  }

  const query = `
    SELECT
      p.id,
      p.author_id,
      u.name AS author_name,
      pr.username AS author_username,
      p.title,
      p.slug,
      p.markdown,
      p.sanitized_html,
      p.views,
      p.created_at,
      p.updated_at,
      COALESCE(
        json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '[]'
      ) AS tags,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND deleted_at IS NULL) AS comments_count,
      p.shares_count
      ${userId ? `, EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id=$${userIdIndex}) AS is_liked` : ""}
    FROM posts p
    LEFT JOIN users u ON u.id = p.author_id
    LEFT JOIN profiles pr ON pr.user_id = u.id
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug=$1
    GROUP BY p.id, u.name, pr.username
  `;

  const { rows } = await pool.query(query, values);
  const post = rows[0];

  if (!post) throw new ApiError(404, "Post not found");

  // Fetch comments
  const commentsRes = await pool.query(
    `
    SELECT
      c.id,
      c.content AS text,
      c.created_at,
      c.user_id,
      COALESCE(pr.username, 'Deleted User') AS username
    FROM post_comments c
    LEFT JOIN profiles pr ON pr.user_id = c.user_id
    WHERE c.post_id = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
    `,
    [post.id],
  );

  post.comments = commentsRes.rows;

  return post;
}

export async function updatePost(
  postId,
  data,
  userId,
  userRole,
  clientProvidedUpdatedAt,
) {
  const { rows } = await pool.query(`SELECT * FROM posts WHERE id=$1`, [
    postId,
  ]);
  if (!rows[0]) throw new ApiError(404, "Post not found");

  const post = rows[0];
  const isAuthor = String(post.author_id) === String(userId);
  if (!isAuthor && userRole !== "admin")
    throw new ApiError(403, "Unauthorized");

  // Optimistic locking check
  if (
    clientProvidedUpdatedAt &&
    post.updated_at.toISOString() !== clientProvidedUpdatedAt
  ) {
    throw new ApiError(409, "Post has been updated by another user");
  }

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

  if (fields.length) {
    await pool.query(
      `UPDATE posts SET ${fields.join(",")}, updated_at=NOW() WHERE id=$${i}`,
      [...values, postId],
    );
  }

  if (data.tags) {
    await pool.query(`DELETE FROM post_tags WHERE post_id=$1`, [postId]);
    for (const tag of data.tags) {
      const tagRes = await pool.query(
        `INSERT INTO tags(name) VALUES($1)
         ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [tag],
      );
      await pool.query(
        `INSERT INTO post_tags(post_id, tag_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [postId, tagRes.rows[0].id],
      );
    }
  }
}

export async function deletePost(postId, userId, userRole) {
  const { rows } = await pool.query(`SELECT author_id FROM posts WHERE id=$1`, [
    postId,
  ]);
  if (!rows[0]) throw new ApiError(404, "Post not found");

  const isAuthor = String(rows[0].author_id) === String(userId);
  if (!isAuthor && userRole !== "admin")
    throw new ApiError(403, "Unauthorized");

  await pool.query(`UPDATE posts SET deleted_at=NOW() WHERE id=$1`, [postId]);
}

// ---------------------- LIKES ----------------------
export async function likePost(postId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO post_likes(post_id, user_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
      [postId, userId],
    );

    const { rows } = await client.query(
      `SELECT COUNT(*) AS likes_count FROM post_likes WHERE post_id=$1`,
      [postId],
    );

    await client.query("COMMIT");
    return { likesCount: parseInt(rows[0].likes_count) };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function unlikePost(postId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2`,
      [postId, userId],
    );
    const { rows } = await client.query(
      `SELECT COUNT(*) AS likes_count FROM post_likes WHERE post_id=$1`,
      [postId],
    );

    await client.query("COMMIT");
    return { likesCount: parseInt(rows[0].likes_count) };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------- COMMENTS ----------------------
// ---------------------- COMMENTS ----------------------
export async function addComment(postId, userId, text) {
  const sanitizedText = sanitizeHtml(text);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      INSERT INTO post_comments(post_id, user_id, content, created_at)
      VALUES($1, $2, $3, NOW())
      RETURNING id, post_id, user_id, content AS text, created_at
      `,
      [postId, userId, sanitizedText],
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteComment(commentId, userId, userRole) {
  const { rows } = await pool.query(`SELECT * FROM post_comments WHERE id=$1`, [
    commentId,
  ]);
  if (!rows[0]) throw new ApiError(404, "Comment not found");

  const comment = rows[0];
  const post = await pool.query(`SELECT author_id FROM posts WHERE id=$1`, [
    comment.post_id,
  ]);

  const isCommentOwner = String(comment.user_id) === String(userId);
  const isPostOwner =
    post.rows[0] && String(post.rows[0].author_id) === String(userId);

  if (!isCommentOwner && !isPostOwner && userRole !== "admin") {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  const { rows: deleted } = await pool.query(
    `UPDATE post_comments SET deleted_at=NOW() WHERE id=$1 RETURNING *`,
    [commentId],
  );

  return deleted[0];
}

export async function getComments(postId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `
    SELECT 
      c.id,
      c.text,
      c.created_at,
      c.updated_at,
      c.user_id,
      COALESCE(u.name,'Deleted User') AS username
    FROM post_comments c
    LEFT JOIN users u ON u.id=c.user_id
    WHERE c.post_id=$1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
    LIMIT $2 OFFSET $3
    `,
    [postId, limit, offset],
  );

  return rows;
}

// ---------------------- SHARES ----------------------
export async function sharePost(postId) {
  const { rows } = await pool.query(
    "UPDATE posts SET shares_count = COALESCE(shares_count, 0) + 1 WHERE id = $1 RETURNING shares_count",
    [postId],
  );
  if (!rows[0]) throw new ApiError(404, "Post not found");
  return rows[0];
}
