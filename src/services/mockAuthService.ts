// Temporary mock auth service for testing purposes
// This bypasses Supabase Auth to allow immediate testing

interface MockUser {
  id: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
  profile: {
    full_name: string;
    student_id?: string;
    department?: string;
  };
}

const MOCK_USERS: MockUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'student1@paruluniversity.ac.in',
    password: 'Student@123',
    role: 'student',
    profile: {
      full_name: 'Rahul Patel',
      student_id: 'CS2021001',
      department: 'Computer Science'
    }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'faculty1@paruluniversity.ac.in',
    password: 'Faculty@123',
    role: 'faculty',
    profile: {
      full_name: 'Dr. Rajesh Kumar',
      department: 'Computer Science'
    }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'faculty2@paruluniversity.ac.in',
    password: 'Faculty@123',
    role: 'faculty',
    profile: {
      full_name: 'Prof. Meera Singh',
      department: 'Information Technology'
    }
  }
];

export const mockAuthService = {
  login: async (email: string, password: string): Promise<{ user: any; error: string | null }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!mockUser) {
      return { user: null, error: 'Invalid login credentials' };
    }
    
    // Store mock user in localStorage
    localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
    
    return {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        user_metadata: mockUser.profile
      },
      error: null
    };
  },
  
  getCurrentUser: (): any => {
    const stored = localStorage.getItem('mock_auth_user');
    return stored ? JSON.parse(stored) : null;
  },
  
  getUserProfile: async (userId: string): Promise<any> => {
    const mockUser = MOCK_USERS.find(u => u.id === userId);
    if (!mockUser) return null;
    
    return {
      id: mockUser.id,
      full_name: mockUser.profile.full_name,
      email: mockUser.email,
      role: mockUser.role,
      student_id: mockUser.profile.student_id,
      department: mockUser.profile.department,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('mock_auth_user');
  }
};

export const isMockMode = process.env.NODE_ENV === 'development' && 
  localStorage.getItem('use_mock_auth') === 'true';