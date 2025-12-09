-- Add a new test admin user
INSERT INTO admin_users (email, password, full_name)
VALUES ('admin2@paruluniversity.ac.in', 'AdminTest@2025', 'Test Admin 2')
ON CONFLICT (email) DO NOTHING;

-- Add a new test faculty user to profiles (only if matching auth.users exists)
INSERT INTO public.profiles (id, full_name, email, role, department)
SELECT au.id, 'Dr. Test Faculty', au.email, 'faculty', 'Physics'
FROM auth.users au
WHERE au.email = 'facultytest@paruluniversity.ac.in'
ON CONFLICT (id) DO NOTHING;

-- Instructions:
-- For faculty login to work, also add the user in Supabase Auth:
-- Email: facultytest@paruluniversity.ac.in
-- Password: FacultyTest@2025
-- Role: faculty
-- Department: Physics
