// Script to create confirmed test users
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://alkfejbhhjwgwjpexuyb.supabase.co";
// You'll need the service role key for this to work
// For now, let's manually insert the profiles

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa2ZlamJoaGp3Z3dqcGV4dXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTg5NDUsImV4cCI6MjA2MTk5NDk0NX0.SgqLET5W2-ijGkmbXXhNa8MWTWFbmNMS_RWdczn5Haw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function insertTestProfiles() {
  console.log('🔧 Inserting test profiles...');

  // Insert test profiles manually (they will be synced with auth.users via triggers)
  const testProfiles = [
    {
      id: '11111111-1111-1111-1111-111111111111', // Student
      full_name: 'Rahul Patel',
      email: 'student1@paruluniversity.ac.in',
      role: 'student',
      student_id: 'CS2021001',
      department: 'Computer Science'
    },
    {
      id: '22222222-2222-2222-2222-222222222222', // Faculty 1
      full_name: 'Dr. Rajesh Kumar',
      email: 'faculty1@paruluniversity.ac.in',
      role: 'faculty',
      department: 'Computer Science'
    },
    {
      id: '33333333-3333-3333-3333-333333333333', // Faculty 2
      full_name: 'Prof. Meera Singh',
      email: 'faculty2@paruluniversity.ac.in',
      role: 'faculty',
      department: 'Information Technology'
    }
  ];

  for (const profile of testProfiles) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'email' });

    if (error) {
      console.log(`❌ Error inserting profile for ${profile.email}:`, error.message);
    } else {
      console.log(`✅ Profile inserted for ${profile.email}`);
    }
  }

  console.log('\n📋 Next steps:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to Authentication > Users');
  console.log('3. Manually add these users with confirmed emails:');
  console.log('   - student1@paruluniversity.ac.in / Student@123');
  console.log('   - faculty1@paruluniversity.ac.in / Faculty@123');
  console.log('   - faculty2@paruluniversity.ac.in / Faculty@123');
  console.log('4. Use the same UUIDs as in the profiles table');
}

insertTestProfiles().catch(console.error);