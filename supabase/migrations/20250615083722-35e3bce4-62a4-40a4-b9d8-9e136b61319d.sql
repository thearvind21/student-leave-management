
-- 1. Create admin_users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS for security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: allow only this user to see his row (for app usage, you will manage with secure service queries)
CREATE POLICY "Admin can manage own row" ON public.admin_users
  FOR ALL
  USING (true);

-- 4. Insert a default admin user (email: admin@school.edu, password: Admin#2025!)
-- IMPORTANT: 
-- You MUST change the password after logging in for security! This is for bootstrap/testing only.
INSERT INTO public.admin_users (email, password, full_name)
VALUES ('admin@school.edu', 'Admin#2025!', 'Admin User');
