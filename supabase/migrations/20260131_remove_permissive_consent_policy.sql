-- Migration: Remove overly permissive INSERT policy on consent_logs
-- This policy is unnecessary since the API uses service_role key which bypasses RLS
-- Removing it prevents potential abuse via direct anon key access

DROP POLICY IF EXISTS "Anyone can insert consent logs" ON consent_logs;

-- Note: Inserts still work via /api/consent because it uses SUPABASE_SERVICE_ROLE_KEY
