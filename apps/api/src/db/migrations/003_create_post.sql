CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  markdown TEXT NOT NULL,
  sanitized_html TEXT NOT NULL,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
