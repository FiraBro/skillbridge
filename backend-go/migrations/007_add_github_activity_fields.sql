-- Add new columns to github_stats table for enhanced activity tracking
ALTER TABLE github_stats 
ADD COLUMN IF NOT EXISTS commits_30d INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_created TIMESTAMP;
