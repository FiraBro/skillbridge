-- Ensure github_stats has all columns required by github.repository.saveGitHubStats
-- (in case 015 was not applied or schema diverged)
ALTER TABLE github_stats
ADD COLUMN IF NOT EXISTS top_languages JSONB,
ADD COLUMN IF NOT EXISTS contribution_streak INTEGER,
ADD COLUMN IF NOT EXISTS consistency_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS github_bio TEXT,
ADD COLUMN IF NOT EXISTS github_following INTEGER,
ADD COLUMN IF NOT EXISTS account_age_months INTEGER,
ADD COLUMN IF NOT EXISTS weekly_activity JSONB,
ADD COLUMN IF NOT EXISTS most_active_days JSONB,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'verified',
ADD COLUMN IF NOT EXISTS last_sync_with_github TIMESTAMP;
