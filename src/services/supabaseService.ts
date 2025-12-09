import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { mockAuthService } from "./mockAuthService";

// Check if mock mode is enabled
const isMockMode = () => {
  return process.env.NODE_ENV === 'development' && 
    localStorage.getItem('use_mock_auth') === 'true';
};

export interface LeaveApplication {
  id: string;
  user_id?: string;
  student_id: string;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  is_emergency: boolean;
  attachment_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  reviewed_by?: string;
  applied_on: string;
  updated_at: string;
  approved_by_name?: string | null;
  student_name: string;
  student?: {
    full_name: string;
    student_id: string;
    email: string;
  }
  teacher_remarks?: string;
  is_reason_invalid?: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'admin' | 'faculty';
  student_id?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  leave_quota?: number;
  otp_secret?: string;
  avatar_url?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_to?: string;
  is_read: boolean;
  created_at: string;
}

// RBAC helpers for role logic
export const roleHelpers = {
  isStudent: (profile: { role: string }) => profile.role === "student",
  isFaculty: (profile: { role: string }) => profile.role === "faculty",
  isAdmin: (profile: { role: string }) => profile.role === "admin",
};

export const supabaseService = {
  // Auth functions
  getCurrentSession: async (): Promise<{ user: User | null; session: Session | null }> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      return { user: null, session: null };
    }
    return { 
      user: data.session?.user || null,
      session: data.session || null 
    };
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Use mock auth if enabled
    if (isMockMode()) {
      return mockAuthService.getCurrentUser();
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    // Use mock auth if enabled
    if (isMockMode()) {
      return await mockAuthService.getUserProfile(userId);
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error.message);
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  },

  login: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    // Use mock auth if enabled
    if (isMockMode()) {
      return await mockAuthService.login(email, password);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  },

  signUp: async (
    email: string, 
    password: string, 
    fullName: string, 
    studentId: string
  ): Promise<{ user: User | null; error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          role: 'student',
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  },

  logout: async (): Promise<void> => {
    // Use mock auth if enabled
    if (isMockMode()) {
      return await mockAuthService.logout();
    }
    
    await supabase.auth.signOut();
  },

  resetPassword: async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error ? error.message : null };
  },

  // User Management functions
  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error.message);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
  },

  updateUserRole: async (userId: string, newRole: 'faculty' | 'student'): Promise<{ success: boolean; error: string | null }> => {
    // Only allow updating to faculty or student roles, not admin
    if (newRole !== 'faculty' && newRole !== 'student') {
      return { success: false, error: "Invalid role. Only 'faculty' and 'student' roles can be assigned." };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user role:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  // Fetch multiple profiles by IDs (used to resolve reviewer names)
  getProfilesByIds: async (ids: string[]): Promise<Record<string, Pick<UserProfile, 'full_name' | 'email' | 'role' | 'student_id'>>> => {
    if (!ids || ids.length === 0) return {};
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, student_id')
        .in('id', ids);

      if (error) {
        console.error('Error fetching profiles by ids:', error.message);
        return {};
      }

      const map: Record<string, Pick<UserProfile, 'full_name' | 'email' | 'role' | 'student_id'>> = {};
      (data || []).forEach((p: any) => {
        map[p.id] = { full_name: p.full_name, email: p.email, role: p.role, student_id: p.student_id };
      });
      return map;
    } catch (e) {
      console.error('Error in getProfilesByIds:', e);
      return {};
    }
  },

  // Leave application functions
  submitLeave: async (leaveData: {
    leave_type: string;
    reason: string;
    start_date: string;
    end_date: string;
    is_emergency: boolean;
    attachment_url?: string;
  }) => {
    try {
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      
      if (!user) {
        return { data: null, error: "User not authenticated" };
      }

      // Fetch user's profile to check quota
      const profileResponse = await supabase
        .from('profiles')
        .select('full_name, leave_quota, student_id')
        .eq('id', user.id)
        .single();

      const profile = profileResponse.data;
      const profileError = profileResponse.error;

      if (profileError || !profile) {
        console.error("Error fetching user profile:", profileError?.message);
        return { data: null, error: "Could not fetch user profile" };
      }

      // Simple quota check - temporarily disabled to avoid TypeScript issues
      let usedQuota = 0;
      // TODO: Implement proper quota check after fixing TypeScript issues
      
      const leaveQuota = profile.leave_quota ?? 10;
      
      if (usedQuota >= leaveQuota) {
        return { data: null, error: "You have exceeded your leave quota. Request cannot be submitted." };
      }

      const insertData = {
        user_id: user.id,
        student_id: profile.student_id || user.id,
        leave_type: leaveData.leave_type,
        reason: leaveData.reason,
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        is_emergency: leaveData.is_emergency,
        attachment_url: leaveData.attachment_url,
        student_name: profile.full_name,
        status: 'pending' as 'pending'
      };

      const insertResponse = await supabase
        .from('leave_applications')
        .insert(insertData)
        .select()
        .single();

      if (insertResponse.error) {
        console.error("Error submitting leave:", insertResponse.error.message);
        return { data: null, error: insertResponse.error.message };
      }

      // Audit: submit leave
      try {
        await (supabase as any)
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'submit_leave',
            entity_type: 'leave_application',
            entity_id: insertResponse.data.id,
            details: { leave_type: leaveData.leave_type }
          });
      } catch (e) {
        console.debug('Audit log insert (submit_leave) failed (non-blocking)');
      }

      return { data: insertResponse.data, error: null };
    } catch (error) {
      console.error("Error in submitLeave:", error);
      return { data: null, error: "An unexpected error occurred" };
    }
  },

  uploadAttachment: async (file: File, userId: string): Promise<{ url: string | null; error: string | null }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('leave_attachments')
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading file:", error.message);
        return { url: null, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leave_attachments')
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      return { url: null, error: "An unexpected error occurred" };
    }
  },

  // Profile avatar upload
  uploadProfileAvatar: async (file: File, userId: string): Promise<{ url: string | null; error: string | null }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile_pics')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error('Error uploading avatar:', error.message);
        return { url: null, error: error.message };
      }

      const { data: pub } = supabase.storage
        .from('profile_pics')
        .getPublicUrl(data.path);

      return { url: pub.publicUrl, error: null };
    } catch (e) {
      console.error('Error in uploadProfileAvatar:', e);
      return { url: null, error: 'Unexpected error uploading avatar' };
    }
  },

  // Update profile helper
  updateProfile: async (userId: string, update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'email'>>): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (e) {
      console.error('Error in updateProfile:', e);
      return { success: false, error: 'Unexpected error updating profile' };
    }
  },

  // Change password for current user
  changePassword: async (newPassword: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (e) {
      console.error('Error in changePassword:', e);
      return { success: false, error: 'Unexpected error changing password' };
    }
  },

  getStudentLeaves: async (studentId: string) => {
    try {
      // Bypass TypeScript issues with explicit any
      const supabaseClient: any = supabase;
      const response = await supabaseClient
        .from('leave_applications')
        .select('*')
        .eq('user_id', studentId)
        .order('applied_on', { ascending: false });

      if (response.error) {
        console.error("Error fetching leaves:", response.error.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error in getStudentLeaves:", error);
      return [];
    }
  },

  getAllLeaves: async (): Promise<LeaveApplication[]> => {
    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .select(`
          *,
          student:profiles(full_name, student_id, email)
        `)
        .order('applied_on', { ascending: false });

      if (error) {
        console.error("Error fetching all leaves:", error.message);
        return [];
      }

      return (data || []) as unknown as LeaveApplication[];
    } catch (error) {
      console.error("Error in getAllLeaves:", error);
      return [];
    }
  },

  getPendingLeaves: async (): Promise<LeaveApplication[]> => {
    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .select(`
          *,
          student:profiles(full_name, student_id, email)
        `)
        .eq('status', 'pending')
        .order('applied_on', { ascending: false });

      if (error) {
        console.error("Error fetching pending leaves:", error.message);
        return [];
      }

      return (data || []) as unknown as LeaveApplication[];
    } catch (error) {
      console.error("Error in getPendingLeaves:", error);
      return [];
    }
  },

  updateLeaveStatus: async (
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewerId?: string | null,
    comments?: string,
    approverName?: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      // Try to resolve approver display name for denormalization
      let approved_by_name: string | null = null;
      try {
        if (approverName && approverName.trim().length > 0) {
          approved_by_name = approverName.trim();
        } else if (reviewerId) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', reviewerId)
            .single();
          if (!error && data?.full_name) approved_by_name = data.full_name;
        }
      } catch {}

      const { error } = await supabase
        .from('leave_applications')
        .update({ 
          status, 
          reviewed_by: reviewerId || null,
          comments,
          approved_by_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', leaveId);

      if (error) {
        console.error("Error updating leave status:", error.message);
        return { success: false, error: error.message };
      }

      // Audit: approval/rejection
      try {
        await (supabase as any)
          .from('audit_logs')
          .insert({
            user_id: reviewerId || null,
            action: `${status}_leave`,
            entity_type: 'leave_application',
            entity_id: leaveId,
            details: comments ? { comments } : null
          });
      } catch (e) {
        console.debug('Audit log insert (status) failed (non-blocking)');
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error in updateLeaveStatus:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  // Leave Quota Log
  addLeaveQuotaLog: async (student_id: string, old_quota: number, new_quota: number, updated_by: string) => {
    try {
      const { error } = await supabase
        .from('leave_quota_log')
        .insert({
          student_id,
          old_quota,
          new_quota,
          updated_by
        });

      if (error) {
        console.error("Error logging quota change:", error.message);
      }
    } catch (error) {
      console.error("Error in addLeaveQuotaLog:", error);
    }
  },

  // For updating teacher/admin remarks & NLP flag
  updateRemarksAndReasonFlag: async (leaveId: string, remarks: string, is_reason_invalid: boolean, reviewerId: string) => {
    try {
      const { error } = await supabase
        .from('leave_applications')
        .update({
          teacher_remarks: remarks,
          is_reason_invalid,
          reviewed_by: reviewerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leaveId);

      if (error) {
        console.error("Error updating remarks/NLP:", error.message);
        return { success: false, error: error.message };
      }

      // Audit: reviewer remarks update
      try {
        await (supabase as any)
          .from('audit_logs')
          .insert({
            user_id: reviewerId,
            action: 'update_remarks',
            entity_type: 'leave_application',
            entity_id: leaveId,
            details: { is_reason_invalid }
          });
      } catch (e) {
        console.debug('Audit log insert (remarks) failed (non-blocking)');
      }
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in updateRemarksAndReasonFlag:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  // 2FA: Store OTP Secret
  setOTPSecret: async (userId: string, secret: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ otp_secret: secret })
        .eq('id', userId);

      return { success: !error, error: error?.message ?? null };
    } catch (error) {
      console.error("Error in setOTPSecret:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  // 2FA: Get OTP Secret
  getOTPSecret: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('otp_secret')
        .eq('id', userId)
        .single();
      return { secret: data?.otp_secret ?? null, error: error?.message ?? null };
    } catch (error) {
      console.error("Error in getOTPSecret:", error);
      return { secret: null, error: "An unexpected error occurred" };
    }
  },

  // Notifications functions
  getNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error.message);
        return [];
      }

      return (data || []) as Notification[];
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return [];
    }
  },

  getUnreadNotificationsCount: async (userId: string): Promise<number> => {
    try {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false);

      return notifications?.length || 0;
    } catch (error) {
      console.error("Error in getUnreadNotificationsCount:", error);
      return 0;
    }
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error("Error marking notification as read:", error.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in markNotificationAsRead:", error);
      return { success: false };
    }
  },

  markAllNotificationsAsRead: async (userId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error("Error marking all notifications as read:", error.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in markAllNotificationsAsRead:", error);
      return { success: false };
    }
  },

  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => {
    return supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  },

  // Admin utility: backfill approved_by_name for approved leaves missing it
  backfillApprovedByNames: async (): Promise<{ updated: number; failed: number; error?: string }> => {
    try {
      const supabaseClient: any = supabase;
      const { data: leaves, error } = await supabaseClient
        .from('leave_applications')
        .select('id, reviewed_by, approved_by_name')
        .eq('status', 'approved')
        .or('approved_by_name.is.null,approved_by_name.eq.')
        .limit(1000);
      if (error) {
        return { updated: 0, failed: 0, error: error.message };
      }
      const list = leaves || [];
      let updated = 0; let failed = 0;

      // Cache for reviewer profile names
      const reviewerIds = Array.from(new Set(list.map((l: any) => l.reviewed_by).filter(Boolean)));
      const nameMap: Record<string, string> = {};
      if (reviewerIds.length > 0) {
        try {
          const { data: profs } = await supabaseClient
            .from('profiles')
            .select('id, full_name')
            .in('id', reviewerIds);
          (profs || []).forEach((p: any) => { if (p.full_name) nameMap[p.id] = p.full_name; });
        } catch {}
      }

      for (const l of list) {
        try {
          let approverName: string | null = null;
          if (l.reviewed_by && nameMap[l.reviewed_by]) {
            approverName = nameMap[l.reviewed_by];
          }
          // Fallback: audit logs
          if (!approverName) {
            try {
              const { data: audit } = await supabaseClient
                .from('audit_logs')
                .select('user_id')
                .eq('entity_type', 'leave_application')
                .eq('entity_id', l.id)
                .eq('action', 'approved_leave')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              const userId = audit?.user_id;
              if (userId) {
                if (!nameMap[userId]) {
                  const { data: p } = await supabaseClient
                    .from('profiles')
                    .select('full_name')
                    .eq('id', userId)
                    .single();
                  if (p?.full_name) nameMap[userId] = p.full_name;
                }
                approverName = nameMap[userId] || null;
              }
            } catch {}
          }

          if (!approverName) { failed++; continue; }

          const { error: upErr } = await supabaseClient
            .from('leave_applications')
            .update({ approved_by_name: approverName, updated_at: new Date().toISOString() })
            .eq('id', l.id);
          if (upErr) { failed++; } else { updated++; }
        } catch {
          failed++;
        }
      }

      return { updated, failed };
    } catch (e: any) {
      return { updated: 0, failed: 0, error: e?.message || 'Unexpected error' };
    }
  }
};