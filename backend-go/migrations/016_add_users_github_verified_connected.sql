-- Add GitHub verification and connected-at columns to users (for OAuth connect flow)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS github_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS github_connected_at TIMESTAMP;
