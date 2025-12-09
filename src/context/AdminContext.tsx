import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '@/services/adminService';

interface AdminContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  setAdmin: (admin: AdminUser | null) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdminState] = useState<AdminUser | null>(null);

  // Load admin from localStorage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin) {
      try {
        setAdminState(JSON.parse(storedAdmin));
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  const setAdmin = (adminUser: AdminUser | null) => {
    console.log("[AdminContext] Setting admin:", adminUser);
    setAdminState(adminUser);
    if (adminUser) {
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('admin_user');
    }
  };

  const logout = () => {
    setAdmin(null);
  };

  const value = {
    admin,
    isAdminAuthenticated: !!admin,
    setAdmin,
    logout
  };

  console.log("[AdminContext] Current state:", { admin, isAdminAuthenticated: !!admin });

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};