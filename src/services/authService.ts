
// This is a mock service to simulate authentication
// In a real app, this would connect to your backend API

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
}

const STORAGE_KEY = 'auth_user';

export const authService = {
  // Login user
  login: async (email: string, password: string, role: string): Promise<User> => {
    // This would be an API call in a real app
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }

        // Mock successful login
        const user: User = {
          id: Math.random().toString(36).substring(2, 9),
          name: email.split('@')[0],
          email,
          role: role as 'student' | 'admin',
          ...(role === 'student' ? { studentId: `S${Math.floor(10000 + Math.random() * 90000)}` } : {})
        };

        // Store user in local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        resolve(user);
      }, 800); // Simulate network delay
    });
  },

  // Register new user
  register: async (name: string, email: string, password: string, studentId: string): Promise<User> => {
    // This would be an API call in a real app
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (!name || !email || !password) {
          reject(new Error('All fields are required'));
          return;
        }

        // Mock successful registration
        const user: User = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          role: 'student',
          studentId
        };
        
        // Store user in local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        resolve(user);
      }, 800); // Simulate network delay
    });
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    // This would be an API call in a real app
    return new Promise((resolve) => {
      setTimeout(() => {
        // Always return success in mock
        resolve(true);
      }, 800); // Simulate network delay
    });
  }
};
