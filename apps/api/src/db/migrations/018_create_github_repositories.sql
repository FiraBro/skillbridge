-- Create github_repositories table if missing (from 015; ensures OAuth connect flow can save repos)
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

CREATE INDEX IF NOT EXISTS idx_github_repositories_profile_id ON github_repositories(profile_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_name ON github_repositories(name);
CREATE INDEX IF NOT EXISTS idx_github_repositories_is_pinned ON github_repositories(is_pinned);
