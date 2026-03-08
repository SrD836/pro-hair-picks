CREATE TABLE IF NOT EXISTS public.diagnostico_completo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_session_id text,
  capilar_data jsonb,
  canicie_data jsonb,
  alopecia_data jsonb,
  overall_score integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.diagnostico_completo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnostico_completo"
ON public.diagnostico_completo FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostico_completo"
ON public.diagnostico_completo FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous inserts (no user_id)
CREATE POLICY "Anon can insert diagnostico_completo"
ON public.diagnostico_completo FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);
