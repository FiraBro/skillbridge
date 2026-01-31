-- Add enhanced GitHub fields to support detailed profile integration
-- Add new columns to github_stats table for enhanced activity tracking
ALTER TABLE github_stats
ADD COLUMN IF NOT EXISTS top_languages JSONB,
ADD COLUMN IF NOT EXISTS contribution_streak INTEGER,
ADD COLUMN IF NOT EXISTS consistency_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS pinned_repos JSONB,
ADD COLUMN IF NOT EXISTS hidden_repos JSONB,
ADD COLUMN IF NOT EXISTS github_bio TEXT,
ADD COLUMN IF NOT EXISTS github_following INTEGER,
ADD COLUMN IF NOT EXISTS account_age_months INTEGER,
ADD COLUMN IF NOT EXISTS weekly_activity JSONB,
ADD COLUMN IF NOT EXISTS most_active_days JSONB,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'verified',
ADD COLUMN IF NOT EXISTS last_sync_with_github TIMESTAMP;

-- Create a new table for detailed repository information
CREATE TABLE IF NOT EXISTS github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    language VARCHAR(100),
    last_updated TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    custom_description TEXT,
    demo_url VARCHAR(500),
    readme_preview TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_github_repositories_profile_id ON github_repositories(profile_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_name ON github_repositories(name);
CREATE INDEX IF NOT EXISTS idx_github_repositories_is_pinned ON github_repositories(is_pinned);

-- Add foreign key constraint to profiles table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_profiles_github_stats' 
                   AND table_name = 'profiles') THEN
        ALTER TABLE profiles ADD CONSTRAINT fk_profiles_github_stats 
        FOREIGN KEY (id) REFERENCES github_stats(profile_id);
    END IF;
END $$;