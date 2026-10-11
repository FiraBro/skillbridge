-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_range VARCHAR(100), -- e.g., "$1000 - $2000"
    status VARCHAR(20) DEFAULT 'open', -- open, closed, rewarded
    required_skills JSONB DEFAULT '[]', -- Array of skill names or IDs
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, developer_id) -- Prevents multiple applications for same job
);

-- Index for searching jobs by status
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Index for searching applications by developer
CREATE INDEX IF NOT EXISTS idx_job_apps_developer ON job_applications(developer_id);
