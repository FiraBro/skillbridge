CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id) -- prevents duplicate likes
);

CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
