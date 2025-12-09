// Script to check user profiles and roles
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://alkfejbhhjwgwjpexuyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa2ZlamJoaGp3Z3dqcGV4dXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTg5NDUsImV4cCI6MjA2MTk5NDk0NX0.SgqLET5W2-ijGkmbXXhNa8MWTWFbmNMS_RWdczn5Haw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserData() {
  console.log('🔍 Checking user profiles...');

  // Check profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.log('❌ Error fetching profiles:', profilesError.message);
  } else {
    console.log('✅ Profiles found:', profiles?.length || 0);
    profiles?.forEach(profile => {
      console.log(`  - ${profile.email}: ${profile.role} (${profile.full_name})`);
    });
  }

  // Check admin_users table
  const { data: admins, error: adminsError } = await supabase
    .from('admin_users')
    .select('*');

  if (adminsError) {
    console.log('❌ Error fetching admin users:', adminsError.message);
  } else {
    console.log('✅ Admin users found:', admins?.length || 0);
    admins?.forEach(admin => {
      console.log(`  - ${admin.email}: ${admin.full_name}`);
    });
  }

  // Test login for each user type
  console.log('\n🧪 Testing logins...');
  
  // Test student login
  const studentLogin = await supabase.auth.signInWithPassword({
    email: 'student1@paruluniversity.ac.in',
    password: 'Student@123'
  });
  
  if (studentLogin.error) {
    console.log('❌ Student login failed:', studentLogin.error.message);
  } else {
    console.log('✅ Student login successful');
    await supabase.auth.signOut();
  }

  // Test faculty login
  const facultyLogin = await supabase.auth.signInWithPassword({
    email: 'faculty1@paruluniversity.ac.in',
    password: 'Faculty@123'
  });
  
  if (facultyLogin.error) {
    console.log('❌ Faculty login failed:', facultyLogin.error.message);
  } else {
    console.log('✅ Faculty login successful');
    await supabase.auth.signOut();
  }
}

checkUserData().catch(console.error);