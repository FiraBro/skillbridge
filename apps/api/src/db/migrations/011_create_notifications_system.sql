-- Create profile views table for analytics and notifications
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null for anonymous or guest
    viewer_role VARCHAR(50), -- Store role at time of view (e.g., 'company')
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create contact requests table (simplified state machine)
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, ignored
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_contact_request UNIQUE (sender_id, receiver_id)
);

-- Index for searching views by profile
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id);

-- Index for searching requests by receiver
CREATE INDEX IF NOT EXISTS idx_contact_requests_receiver ON contact_requests(receiver_id);
