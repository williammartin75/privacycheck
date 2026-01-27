-- Scheduled Scans Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS scheduled_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain TEXT NOT NULL,
    frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    last_run TIMESTAMPTZ,
    last_score INTEGER,
    next_run TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- Index for cron job queries
CREATE INDEX idx_scheduled_scans_next_run ON scheduled_scans(next_run) WHERE is_active = true;
CREATE INDEX idx_scheduled_scans_user ON scheduled_scans(user_id);

-- RLS Policies
ALTER TABLE scheduled_scans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own schedules
CREATE POLICY "Users can view own schedules" ON scheduled_scans
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own schedules
CREATE POLICY "Users can create schedules" ON scheduled_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY "Users can update own schedules" ON scheduled_scans
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY "Users can delete own schedules" ON scheduled_scans
    FOR DELETE USING (auth.uid() = user_id);

-- Service role can update all (for cron job)
CREATE POLICY "Service can update all" ON scheduled_scans
    FOR ALL USING (true)
    WITH CHECK (true);
