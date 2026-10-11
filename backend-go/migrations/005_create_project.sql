CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  github_repo TEXT NOT NULL,
  live_demo TEXT,
  tech_stack TEXT[] NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT,
  views INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility = 'public'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, github_repo)
);


CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_tech_stack ON projects USING GIN(tech_stack);
CREATE INDEX idx_projects_views ON projects(views DESC);
