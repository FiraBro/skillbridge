-- Create endorsements table
CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorsed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Prevent self-endorsements and duplicate endorsements
    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsed_id),
    CONSTRAINT unique_endorsement UNIQUE (endorser_id, endorsed_id, skill_id)
);

-- Create reputation history table
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_score INT NOT NULL,
    new_score INT NOT NULL,
    change_amount INT NOT NULL,
    reason VARCHAR(50) NOT NULL, -- 'post_created', 'post_liked', 'project_added', 'endorsement_received', 'github_sync'
    metadata JSONB, -- Additional context (e.g., post_id, project_id, endorser_id)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_endorsements_endorsed ON endorsements(endorsed_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_skill ON endorsements(skill_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_user ON reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created ON reputation_history(created_at DESC);

-- Add like_count to posts for caching (denormalized for performance)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- Create function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes
DROP TRIGGER IF EXISTS trigger_update_post_like_count ON post_likes;
CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();
