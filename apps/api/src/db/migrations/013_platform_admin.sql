-- Create content reports table
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'project', 'developer', 'job'
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create platform settings table for dynamic configuration (Reputation Weights, etc.)
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default reputation weights
INSERT INTO platform_settings (key, value, description)
VALUES (
    'reputation_weights',
    '{
        "skill": 10,
        "repo": 5,
        "follower": 3,
        "star": 2,
        "commit": 0.1,
        "commit_30d": 2,
        "post": 15,
        "like": 3,
        "project": 20,
        "endorsement": 25,
        "longevity_max": 50
    }'::jsonb,
    'Weights used by the reputation engine to calculate user scores.'
) ON CONFLICT (key) DO NOTHING;

-- Add index for moderation status
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content ON content_reports(content_type, content_id);
