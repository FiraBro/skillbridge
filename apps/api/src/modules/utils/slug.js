import slugify from "slugify";
import { pool } from "../../config/db.js";
export async function generateUniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (true) {
    const { rowCount } = await pool.query(
      "SELECT 1 FROM posts WHERE slug = $1",
      [slug],
    );

    if (rowCount === 0) return slug;
    slug = `${base}-${counter++}`;
  }
}
