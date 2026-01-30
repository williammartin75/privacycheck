-- Scan History Table for tracking user scans and rate limiting
-- Created: 2026-01-30

CREATE TABLE IF NOT EXISTS scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  url TEXT NOT NULL,
  tier TEXT DEFAULT 'free', -- free, pro, pro_plus
  scan_type TEXT DEFAULT 'manual', -- manual, scheduled, api
  pages_scanned INTEGER DEFAULT 1,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by user and date
CREATE INDEX idx_scan_history_user_date ON scan_history(user_id, created_at DESC);
CREATE INDEX idx_scan_history_email ON scan_history(user_email);
CREATE INDEX idx_scan_history_created ON scan_history(created_at DESC);

-- Enable RLS
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Admin can view all
CREATE POLICY "Service role can do all" ON scan_history
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own scans
CREATE POLICY "Users can view own scans" ON scan_history
  FOR SELECT USING (auth.uid() = user_id);

-- Function to count monthly scans for a user
CREATE OR REPLACE FUNCTION get_monthly_scan_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM scan_history
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', NOW())
    AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
$$ LANGUAGE SQL STABLE;

-- Function to get scan limit by tier
CREATE OR REPLACE FUNCTION get_scan_limit(p_tier TEXT)
RETURNS INTEGER AS $$
  SELECT CASE 
    WHEN p_tier = 'pro_plus' THEN 200
    WHEN p_tier = 'pro' THEN 50
    ELSE 10  -- free tier
  END;
$$ LANGUAGE SQL IMMUTABLE;
