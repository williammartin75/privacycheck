-- Migration: Create consent_logs table for GDPR audit trail
-- PrivacyChecker.pro - Consent Logging Feature

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('accept', 'reject')),
  ip_hash TEXT,
  user_agent TEXT,
  categories JSONB DEFAULT '{"necessary": true, "analytics": false, "marketing": false, "preferences": false}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_logs_site_id ON consent_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_created_at ON consent_logs(created_at DESC);

-- RLS Policy: Users can only see their own site's consent logs
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent logs"
  ON consent_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert consent logs"
  ON consent_logs
  FOR INSERT
  WITH CHECK (true);
