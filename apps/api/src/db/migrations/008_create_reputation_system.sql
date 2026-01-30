-- 1. Endorsements (The "Vouch" System)
CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endorsed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsed_id),
    CONSTRAINT unique_skill_endorsement UNIQUE (endorser_id, endorsed_id, skill_id)
);

-- 2. Reputation History (The Audit Log)
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_score INT NOT NULL,
    new_score INT NOT NULL,
    change_amount INT NOT NULL,
    reason VARCHAR(50) NOT NULL, 
    metadata JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. The Performance Trigger for Likes
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

DROP TRIGGER IF EXISTS trigger_update_post_like_count ON post_likes;
CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();