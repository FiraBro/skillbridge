-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- Profiles table
-- =====================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,        -- public handle
    full_name VARCHAR(120),
    bio TEXT,
    location VARCHAR(120),
    github_username VARCHAR(100),
    reputation_score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index on username for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================
-- Skills table
-- =====================================
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- =====================================
-- Many-to-Many: Profile ↔ Skills
-- =====================================
CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, skill_id)
);

-- =====================================
-- Cached GitHub metrics
-- =====================================
CREATE TABLE IF NOT EXISTS github_stats (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    public_repos INT,
    followers INT,
    total_stars INT,
    total_commits INT,
    commits_30d INT DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    last_activity TIMESTAMP,
    account_created TIMESTAMP,
    last_synced_at TIMESTAMP
);

