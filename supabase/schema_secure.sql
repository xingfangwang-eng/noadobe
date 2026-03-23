-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  unique_id TEXT UNIQUE NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tenant_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  x_percent DECIMAL(5, 2) NOT NULL,
  y_percent DECIMAL(5, 2) NOT NULL,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  max_designs INTEGER DEFAULT 10,
  max_comments_per_design INTEGER DEFAULT 100,
  max_file_size_mb INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Designs policies
CREATE POLICY "Users can view own designs" ON designs
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view public designs" ON designs
  FOR SELECT
  TO public
  USING (is_public = TRUE);

CREATE POLICY "Users can create own designs" ON designs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own designs" ON designs
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own designs" ON designs
  FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Comments policies
CREATE POLICY "Users can view comments for accessible designs" ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = comments.design_id 
      AND (designs.user_id::text = auth.uid()::text OR designs.is_public = TRUE)
    )
  );

CREATE POLICY "Public can view comments for public designs" ON comments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = comments.design_id 
      AND designs.is_public = TRUE
    )
  );

CREATE POLICY "Users can create comments for accessible designs" ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = comments.design_id 
      AND (designs.user_id::text = auth.uid()::text OR designs.is_public = TRUE)
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Tenants policies
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT tenant_id FROM users WHERE id::text = auth.uid()::text
  ));

-- Usage logs policies
CREATE POLICY "Users can create own usage logs" ON usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_tenant_id ON designs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_designs_unique_id ON designs(unique_id);
CREATE INDEX IF NOT EXISTS idx_designs_is_public ON designs(is_public);
CREATE INDEX IF NOT EXISTS idx_comments_design_id ON comments(design_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_tenant_id ON comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_designs_user_tenant ON designs(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_comments_design_tenant ON comments(design_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_created ON usage_logs(user_id, created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
