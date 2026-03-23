-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id TEXT NOT NULL,
  x_percent DECIMAL(5, 2) NOT NULL,
  y_percent DECIMAL(5, 2) NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON comments
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_design_id ON comments(design_id);