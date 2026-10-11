-- Create company profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    industry VARCHAR(100),
    size VARCHAR(50), -- e.g., "1-10", "11-50", "51-200", "201-500", "500+"
    website TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enhance jobs table with outcomes and trial-friendly flag
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
ADD COLUMN IF NOT EXISTS trial_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- Create developer bookmarks table
CREATE TABLE IF NOT EXISTS developer_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, developer_id)
);

-- Enhance job applications with hiring feedback and private notes
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS private_notes TEXT,
ADD COLUMN IF NOT EXISTS hiring_status VARCHAR(20) DEFAULT 'applied'; -- applied, contacted, trial_started, hired, rejected

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_company ON developer_bookmarks(company_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_status ON job_applications(hiring_status);
