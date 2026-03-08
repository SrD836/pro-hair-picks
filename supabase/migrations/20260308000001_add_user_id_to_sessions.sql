-- Add user_id column (nullable, for authenticated users)
ALTER TABLE hair_diagnostic_sessions
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Enable RLS if not already enabled
ALTER TABLE hair_diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any exist (safe to run)
DROP POLICY IF EXISTS "Users can insert own sessions" ON hair_diagnostic_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON hair_diagnostic_sessions;
DROP POLICY IF EXISTS "Anon can insert with session_id" ON hair_diagnostic_sessions;
DROP POLICY IF EXISTS "Allow anon insert" ON hair_diagnostic_sessions;

-- INSERT for authenticated users
CREATE POLICY "Users can insert own sessions"
ON hair_diagnostic_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- SELECT for authenticated users (own sessions only)
CREATE POLICY "Users can view own sessions"
ON hair_diagnostic_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT for anonymous users (no user_id, only user_session_id)
CREATE POLICY "Anon can insert with session_id"
ON hair_diagnostic_sessions FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

