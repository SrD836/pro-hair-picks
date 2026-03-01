-- supabase/migrations/20260301100000_user_diagnostics.sql

CREATE TABLE IF NOT EXISTS public.user_diagnostics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  result_summary text NOT NULL DEFAULT '',
  full_result jsonb NOT NULL DEFAULT '{}',
  is_complete_diagnostic boolean NOT NULL DEFAULT false,
  share_token text UNIQUE DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user history queries
CREATE INDEX IF NOT EXISTS user_diagnostics_user_tool_date
  ON public.user_diagnostics (user_id, tool_id, created_at DESC);

-- Index for share token lookups
CREATE INDEX IF NOT EXISTS user_diagnostics_share_token
  ON public.user_diagnostics (share_token)
  WHERE share_token IS NOT NULL;

-- Enable RLS
ALTER TABLE public.user_diagnostics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own records
CREATE POLICY "users_see_own_diagnostics"
  ON public.user_diagnostics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "users_insert_own_diagnostics"
  ON public.user_diagnostics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can read shared diagnostics (share_token lookup)
CREATE POLICY "public_read_shared_diagnostics"
  ON public.user_diagnostics
  FOR SELECT
  USING (share_token IS NOT NULL);
