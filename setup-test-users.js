// Setup script to create test users in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://alkfejbhhjwgwjpexuyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa2ZlamJoaGp3Z3dqcGV4dXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTg5NDUsImV4cCI6MjA2MTk5NDk0NX0.SgqLET5W2-ijGkmbXXhNa8MWTWFbmNMS_RWdczn5Haw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUsers() {
  console.log('🚀 Setting up test users...');

  // Test student user
  const studentResult = await supabase.auth.signUp({
    email: 'student1@paruluniversity.ac.in',
    password: 'Student@123',
    options: {
      data: {
        full_name: 'Rahul Patel',
        student_id: 'CS2021001',
        role: 'student',
        department: 'Computer Science'
      }
    }
  });

  if (studentResult.error) {
    console.log('❌ Student user creation error:', studentResult.error.message);
  } else {
    console.log('✅ Student user created successfully');
  }

  // Test faculty users
  const facultyUsers = [
    {
      email: 'faculty1@paruluniversity.ac.in',
      password: 'Faculty@123',
      name: 'Dr. Rajesh Kumar',
      department: 'Computer Science'
    },
    {
      email: 'faculty2@paruluniversity.ac.in',
      password: 'Faculty@123',
      name: 'Prof. Meera Singh',
      department: 'Information Technology'
    },
    {
      email: 'faculty3@paruluniversity.ac.in',
      password: 'Faculty@123',
      name: 'Dr. Anil Sharma',
      department: 'Electronics'
    }
  ];

  for (const faculty of facultyUsers) {
    const facultyResult = await supabase.auth.signUp({
      email: faculty.email,
      password: faculty.password,
      options: {
        data: {
          full_name: faculty.name,
          role: 'faculty',
          department: faculty.department
        }
      }
    });

    if (facultyResult.error) {
      console.log(`❌ Faculty user ${faculty.email} creation error:`, facultyResult.error.message);
    } else {
      console.log(`✅ Faculty user ${faculty.email} created successfully`);
    }
  }

  console.log('🎉 Test user setup complete!');
  console.log('\n📋 Test Credentials:');
  console.log('Student: student1@paruluniversity.ac.in / Student@123');
  console.log('Faculty: faculty1@paruluniversity.ac.in / Faculty@123');
  console.log('Admin: admin@paruluniversity.ac.in / admin123');
}

createTestUsers().catch(console.error);