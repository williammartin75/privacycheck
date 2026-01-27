-- Widget configurations table for Cookie Banner Widget
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Widget identification
    widget_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
    domain TEXT NOT NULL,
    
    -- Appearance
    position TEXT DEFAULT 'bottom-full' CHECK (position IN ('bottom-full', 'bottom-left', 'bottom-right')),
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    
    -- Colors (JSON)
    colors JSONB DEFAULT '{
        "background": "#1a1a2e",
        "text": "#ffffff",
        "buttonAccept": "#4ade80",
        "buttonReject": "#6b7280",
        "buttonPreferences": "#3b82f6"
    }'::jsonb,
    
    -- Texts
    banner_title TEXT DEFAULT 'We use cookies',
    banner_text TEXT DEFAULT 'This website uses cookies to enhance your experience. You can choose which categories to accept.',
    accept_text TEXT DEFAULT 'Accept All',
    reject_text TEXT DEFAULT 'Reject All',
    preferences_text TEXT DEFAULT 'Preferences',
    save_preferences_text TEXT DEFAULT 'Save Preferences',
    privacy_policy_url TEXT,
    
    -- Categories enabled
    categories JSONB DEFAULT '[
        {"id": "necessary", "name": "Necessary", "description": "Essential for website functionality", "required": true},
        {"id": "analytics", "name": "Analytics", "description": "Help us understand how visitors use our site", "required": false},
        {"id": "marketing", "name": "Marketing", "description": "Used for targeted advertising", "required": false},
        {"id": "functional", "name": "Functional", "description": "Enable enhanced features", "required": false}
    ]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, domain)
);

-- Index for fast widget lookup by widget_id
CREATE INDEX IF NOT EXISTS idx_widget_configs_widget_id ON widget_configs(widget_id);

-- RLS Policies
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own widgets
CREATE POLICY "Users can view own widget configs"
    ON widget_configs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own widgets
CREATE POLICY "Users can create widget configs"
    ON widget_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own widgets
CREATE POLICY "Users can update own widget configs"
    ON widget_configs FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own widgets
CREATE POLICY "Users can delete own widget configs"
    ON widget_configs FOR DELETE
    USING (auth.uid() = user_id);

-- Public read access for widget script to fetch config by widget_id
CREATE POLICY "Public can read widget config by widget_id"
    ON widget_configs FOR SELECT
    USING (true);
