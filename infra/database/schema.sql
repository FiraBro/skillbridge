BEGIN;

-- =============================================
-- 1. EXTENSIONS & CLEANUP
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- 1. DROP EVERYTHING FIRST
-- We drop in reverse order of creation or use CASCADE to handle dependencies
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS developer_bookmarks CASCADE;
DROP TABLE IF EXISTS contact_requests CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS reputation_history CASCADE;
DROP TABLE IF EXISTS endorsements CASCADE;
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS profile_skills CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS github_repositories CASCADE;
DROP TABLE IF EXISTS github_stats CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. NOW START THE FRESH CREATION
BEGIN;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ... rest of your CREATE TABLE scripts ...
-- =============================================
-- 2. CORE IDENTITY: USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CHARACTER VARYING UNIQUE NOT NULL,
    username CHARACTER VARYING UNIQUE NOT NULL,
    name CHARACTER VARYING,
    password_hash TEXT,
    role CHARACTER VARYING DEFAULT 'user',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    github_id BIGINT,
    github_username CHARACTER VARYING,
    github_verified BOOLEAN DEFAULT false,
    github_connected_at TIMESTAMP WITHOUT TIME ZONE,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. PROFILES (DEVELOPER & COMPANY)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username CHARACTER VARYING UNIQUE NOT NULL,
    full_name CHARACTER VARYING,
    bio TEXT,
    location CHARACTER VARYING,
    reputation_score INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    industry CHARACTER VARYING,
    size CHARACTER VARYING,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. TAXONOMY: SKILLS & TAGS
-- =============================================
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name CHARACTER VARYING UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- =============================================
-- 5. CONTENT: POSTS & COMMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    markdown TEXT,
    sanitized_html TEXT,
    cover_image CHARACTER VARYING,
    views INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- =============================================
-- 6. GITHUB INTEGRATION
-- =============================================
CREATE TABLE IF NOT EXISTS github_stats (
    profile_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    github_username TEXT,
    github_bio TEXT,
    followers INTEGER DEFAULT 0,
    github_following INTEGER DEFAULT 0,
    public_repos INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    commits_30d INTEGER DEFAULT 0,
    contribution_streak INTEGER DEFAULT 0,
    account_age_months INTEGER DEFAULT 0,
    account_created TIMESTAMP WITHOUT TIME ZONE,
    last_activity TIMESTAMP WITHOUT TIME ZONE,
    last_synced_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sync_with_github TIMESTAMP WITHOUT TIME ZONE,
    verification_status CHARACTER VARYING,
    consistency_score NUMERIC,
    top_languages JSONB,
    weekly_activity JSONB,
    most_active_days JSONB,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS github_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name CHARACTER VARYING,
    description TEXT,
    custom_description TEXT,
    language CHARACTER VARYING,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    readme_preview TEXT,
    demo_url CHARACTER VARYING,
    is_public BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITHOUT TIME ZONE
);

-- =============================================
-- 7. MARKETPLACE: JOBS & PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title CHARACTER VARYING NOT NULL,
    description TEXT,
    budget_range CHARACTER VARYING,
    required_skills JSONB,
    expected_outcome TEXT,
    trial_friendly BOOLEAN DEFAULT false,
    status CHARACTER VARYING DEFAULT 'open',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status CHARACTER VARYING DEFAULT 'pending',
    hiring_status CHARACTER VARYING,
    message TEXT,
    private_notes TEXT,
    milestones JSONB,
    total_bid_amount NUMERIC,
    applied_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title CHARACTER VARYING,
    description TEXT,
    tech_stack TEXT[],
    thumbnail TEXT,
    github_repo TEXT,
    live_demo TEXT,
    views INTEGER DEFAULT 0,
    visibility CHARACTER VARYING DEFAULT 'public',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. SOCIAL & REPUTATION
-- =============================================
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS profile_skills (
    profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, skill_id)
);

CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id),
    viewer_role CHARACTER VARYING,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID REFERENCES users(id),
    endorsed_id UUID REFERENCES users(id),
    skill_id INTEGER REFERENCES skills(id),
    message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    previous_score INTEGER,
    new_score INTEGER,
    change_amount INTEGER,
    reason CHARACTER VARYING,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. SYSTEM & MODERATION
-- =============================================
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id),
    content_id UUID,
    content_type CHARACTER VARYING,
    reason TEXT,
    status CHARACTER VARYING,
    admin_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    message TEXT,
    status CHARACTER VARYING,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS developer_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID REFERENCES users(id),
    company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_settings (
    key CHARACTER VARYING PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;