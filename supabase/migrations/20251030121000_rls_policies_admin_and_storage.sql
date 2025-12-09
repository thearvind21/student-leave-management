-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pics','profile_pics', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on admin_users
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
DROP POLICY IF EXISTS "anon can read admin_users" ON public.admin_users;
CREATE POLICY "anon can read admin_users"
  ON public.admin_users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "anon can update admin_users" ON public.admin_users;
CREATE POLICY "anon can update admin_users"
  ON public.admin_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Storage policies for profile pictures bucket
DROP POLICY IF EXISTS "Public read profile_pics" ON storage.objects;
CREATE POLICY "Public read profile_pics"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_pics');

DROP POLICY IF EXISTS "Public upload profile_pics" ON storage.objects;
CREATE POLICY "Public upload profile_pics"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_pics');

DROP POLICY IF EXISTS "Public update profile_pics" ON storage.objects;
CREATE POLICY "Public update profile_pics"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile_pics')
  WITH CHECK (bucket_id = 'profile_pics');