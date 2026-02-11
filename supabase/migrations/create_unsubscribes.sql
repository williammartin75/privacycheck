-- Create unsubscribes table for email opt-out tracking
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS unsubscribes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    unsubscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    source TEXT DEFAULT 'web' NOT NULL,  -- 'web' (form), 'email_link' (one-click), 'email_reply' (STOP reply)
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast email lookups (used by sending scripts to filter out unsubscribed)
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes (email);

-- Enable Row Level Security
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;

-- Allow inserts from the service role only (API route uses service role key)
-- No public read access needed - only the backend checks this table
CREATE POLICY "Allow service role full access" ON unsubscribes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE unsubscribes IS 'Tracks email opt-outs from campaign emails. Checked by the sending scripts before dispatch.';
COMMENT ON COLUMN unsubscribes.source IS 'How the unsubscribe was triggered: web (form), email_link (one-click URL), email_reply (STOP reply)';
