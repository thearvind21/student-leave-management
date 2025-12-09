# Test Credentials for Student Leave Central

This document contains all the test credentials for different user roles in the Student Leave Central application.

## 🔗 Application URL
- **Local Development**: http://localhost:8081/

## 👨‍💼 Admin Credentials

### Admin User 1
- **Email**: `admin@school.edu`
- **Password**: `Admin#2025!`
- **Role**: Admin
- **Dashboard**: `/admin/dashboard`

### Admin User 2  
- **Email**: `admin@paruluniversity.ac.in`
- **Password**: `admin123`
- **Role**: Admin
- **Dashboard**: `/admin/dashboard`

## 👨‍🏫 Faculty Credentials

**Note**: Faculty accounts need to be created through Supabase Auth. The profiles have been prepared in the database.

### Faculty User 1
- **Email**: `faculty1@paruluniversity.ac.in`
- **Password**: `Faculty@123`
- **Name**: Dr. Rajesh Kumar
- **Department**: Computer Science
- **Role**: Faculty
- **Dashboard**: `/faculty/dashboard`

### Faculty User 2
- **Email**: `faculty2@paruluniversity.ac.in`
- **Password**: `Faculty@123`
- **Name**: Prof. Meera Singh
- **Department**: Information Technology
- **Role**: Faculty
- **Dashboard**: `/faculty/dashboard`

### Faculty User 3
- **Email**: `faculty3@paruluniversity.ac.in`
- **Password**: `Faculty@123`
- **Name**: Dr. Anil Sharma
- **Department**: Electronics
- **Role**: Faculty
- **Dashboard**: `/faculty/dashboard`

## 👨‍🎓 Student Credentials

**Note**: Student accounts need to be created through Supabase Auth or via the signup form.

### Test Student
- **Email**: `student1@paruluniversity.ac.in`
- **Password**: `Student@123`
- **Name**: Rahul Patel
- **Student ID**: CS2021001
- **Department**: Computer Science
- **Role**: Student
- **Dashboard**: `/my-leaves`

## 🔧 Setting Up Test Users

### For Faculty and Student Users:
Since these use Supabase Auth, you need to create them via:

1. **Supabase Dashboard Method**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add User"
   - Use the emails and passwords listed above

2. **Signup Form Method**:
   - Use the application's signup form at `/signup`
   - The profiles will be automatically created

3. **Manual Database Insert** (Advanced):
   ```sql
   -- Insert into auth.users via SQL Editor or API
   -- Then the profiles will be synced automatically
   ```

### For Admin Users:
Admin users are stored in the `admin_users` table and don't use Supabase Auth. They're already set up and ready to use.

## 🔀 Login Flow

### Admin Login:
1. Go to `/login`
2. Click "Admin" tab
3. Enter admin credentials
4. Redirects to `/admin/dashboard`

### Faculty Login:
1. Go to `/login`
2. Click "Faculty" tab
3. Enter faculty credentials
4. Redirects to `/faculty/dashboard`

### Student Login:
1. Go to `/login`
2. Click "Student" tab (default)
3. Enter student credentials
4. Redirects to `/my-leaves`

## 🛡️ Role-Based Access Control

- **Students**: Can access `/apply-leave`, `/my-leaves`, `/calendar`
- **Faculty**: Can access `/faculty/dashboard`, `/faculty/leaves`, `/faculty/my-leaves`
- **Admin**: Can access `/admin/dashboard`, `/admin/leaves`, `/admin/users`

## ⚠️ Security Notes

1. **Change Default Passwords**: These are test credentials only. Change them in production.
2. **Admin Passwords**: Admin passwords are stored in plain text for testing. Use proper hashing in production.
3. **Database Access**: Make sure your Supabase RLS policies are properly configured.

## 🐛 Troubleshooting

### Login Issues:
1. Check browser console for error messages
2. Verify the user exists in the correct table (`admin_users` for admin, `auth.users` for faculty/student)
3. Check that the `profiles` table has the correct role assigned
4. Ensure Supabase connection is working

### Redirect Issues:
1. Check that the user's role is correctly set in the `profiles` table
2. Verify the role-based routing in `App.tsx`
3. Ensure authentication state is properly loaded before redirect

## 📊 Database Tables

- **admin_users**: Admin user credentials (separate from Supabase Auth)
- **auth.users**: Supabase auth users (students and faculty)
- **profiles**: User profiles with role information
- **user_roles**: Role assignments (if using the role service)
- **leave_applications**: Leave request data
- **notifications**: User notifications

## 🚀 Quick Test Checklist

- [ ] Admin login works and redirects to admin dashboard
- [ ] Faculty login works and redirects to faculty dashboard  
- [ ] Student login works and redirects to student dashboard
- [ ] Role-based routes are protected
- [ ] Users can't access unauthorized sections
- [ ] Logout works for all user types