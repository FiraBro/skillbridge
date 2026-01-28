-- Add missing columns to users table for GitHub auth and onboarding
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS github_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS github_username VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
