-- Ensure the faculty profile exists and is correct
INSERT INTO profiles (id, full_name, email, role, department)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'faculty1@paruluniversity.ac.in'),
  'Dr. Rajesh Kumar',
  'faculty1@paruluniversity.ac.in',
  'faculty',
  'Computer Science'
)
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;
