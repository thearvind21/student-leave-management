import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'student' | 'faculty' | 'admin';

export const roleService = {
  // Get user's role from user_roles table
  getUserRole: async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: userId
      });

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

  return data as AppRole;
    } catch (error) {
      console.error("Error in getUserRole:", error);
      return null;
    }
  },

  // Check if user has a specific role
  hasRole: async (userId: string, role: AppRole): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: role
      });

      if (error) {
        console.error("Error checking role:", error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error("Error in hasRole:", error);
      return false;
    }
  },

  // Assign role to user (admin only)
  assignRole: async (userId: string, role: AppRole): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error assigning role:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  // Remove role from user (admin only)
  removeRole: async (userId: string, role: AppRole): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error removing role:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
};
