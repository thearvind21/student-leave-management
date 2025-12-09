
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  created_at: string;
  avatar_url?: string | null;
}

/**
 * Authenticate admin login credentials using the admin_users table.
 *
 * Note: password is stored in plain text for demo bootstrap only!
 * In real apps, always hash/store securely.
 */
export const adminService = {
  login: async (email: string, password: string): Promise<{ admin: AdminUser | null; error: string | null }> => {
    console.log("[AdminService] Attempting admin login with:", { email, password });

    // Query the admin_users table for matching email and password.
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) {
      console.error("[AdminService] Supabase error:", error);
      return { admin: null, error: error.message };
    }
    if (!data) {
      console.warn("[AdminService] No admin found with provided credentials.");
      return { admin: null, error: "Invalid email or password." };
    }
    console.log("[AdminService] Login successful:", data);
    return { admin: data as AdminUser, error: null };
  },

  updateProfile: async (id: string, update: Partial<Pick<AdminUser, 'full_name' | 'avatar_url'>>): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Unexpected error updating admin profile' };
    }
  }
};
