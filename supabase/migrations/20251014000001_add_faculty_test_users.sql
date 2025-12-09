-- Add faculty test users to Supabase Auth and profiles table
-- This migration only creates profiles if matching auth.users already exist.

-- Faculty profiles (use existing auth.users.id to satisfy FK)
INSERT INTO public.profiles (id, full_name, email, role, department)
SELECT au.id, 'Dr. Rajesh Kumar', au.email, 'faculty', 'Computer Science'
FROM auth.users au
WHERE au.email = 'faculty1@paruluniversity.ac.in'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department)
SELECT au.id, 'Prof. Meera Singh', au.email, 'faculty', 'Information Technology'
FROM auth.users au
WHERE au.email = 'faculty2@paruluniversity.ac.in'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, department)
SELECT au.id, 'Dr. Anil Sharma', au.email, 'faculty', 'Electronics'
FROM auth.users au
WHERE au.email = 'faculty3@paruluniversity.ac.in'
ON CONFLICT (id) DO NOTHING;

-- Student profile (only if auth.users exists)
INSERT INTO public.profiles (id, full_name, email, role, student_id, department)
SELECT au.id, 'Rahul Patel', au.email, 'student', 'CS2021001', 'Computer Science'
FROM auth.users au
WHERE au.email = 'student1@paruluniversity.ac.in'
ON CONFLICT (id) DO NOTHING;

-- Notes:
-- - Create the corresponding auth users via Dashboard or Auth API for these profiles to be inserted.
-- - Example passwords:
--   faculty1@paruluniversity.ac.in | Faculty@123
--   faculty2@paruluniversity.ac.in | Faculty@123
--   faculty3@paruluniversity.ac.in | Faculty@123
--   student1@paruluniversity.ac.in | Student@123