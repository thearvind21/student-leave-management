-- Insert admin user credentials
INSERT INTO admin_users (email, password, full_name)
VALUES ('admin@paruluniversity.ac.in', 'admin123', 'System Administrator')
ON CONFLICT (email) DO NOTHING;