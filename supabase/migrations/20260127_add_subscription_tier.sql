-- Add tier column to subscriptions table
-- Tier can be: 'pro' or 'pro_plus'

-- First, check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'tier'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN tier TEXT DEFAULT 'pro' CHECK (tier IN ('pro', 'pro_plus'));
    END IF;
END $$;

-- Update existing subscriptions to 'pro' (they were all Pro before this change)
UPDATE subscriptions SET tier = 'pro' WHERE tier IS NULL;
