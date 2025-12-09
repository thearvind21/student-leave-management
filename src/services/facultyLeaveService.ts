import { supabase } from "@/integrations/supabase/client";

export interface FacultyLeaveApplication {
  id: string;
  faculty_id: string;
  faculty_name?: string | null;
  faculty_email?: string | null;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  is_emergency: boolean;
  attachment_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_remarks?: string;
  reviewed_by?: string;
  approved_by_name?: string | null;
  applied_on: string;
  updated_at: string;
  faculty?: {
    full_name: string;
    email: string;
  };
}

export const facultyLeaveService = {
  // Submit faculty leave application
  submitFacultyLeave: async (leaveData: {
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

      // Get faculty profile for denormalized fields
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      if (profErr) {
        console.warn('Could not fetch faculty profile for denorm fields:', profErr.message);
      }

      const insertData = {
        faculty_id: user.id,
        leave_type: leaveData.leave_type,
        reason: leaveData.reason,
        start_date: leaveData.start_date,
        end_date: leaveData.end_date,
        is_emergency: leaveData.is_emergency,
        attachment_url: leaveData.attachment_url,
        status: 'pending' as const,
        faculty_name: prof?.full_name || null,
        faculty_email: prof?.email || null
      };

      const { data, error } = await supabase
        .from('faculty_leave_applications')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error submitting faculty leave:", error.message);
        return { data: null, error: error.message };
      }

      // Audit: faculty submit
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'submit_faculty_leave',
            entity_type: 'faculty_leave_application',
            entity_id: data.id,
            details: { leave_type: leaveData.leave_type }
          });
      } catch {}

      return { data, error: null };
    } catch (error) {
      console.error("Error in submitFacultyLeave:", error);
      return { data: null, error: "An unexpected error occurred" };
    }
  },

  // Get faculty's own leave applications
  getFacultyLeaves: async (facultyId: string): Promise<FacultyLeaveApplication[]> => {
    try {
      const { data, error } = await supabase
        .from('faculty_leave_applications')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('applied_on', { ascending: false });

      if (error) {
        console.error("Error fetching faculty leaves:", error.message);
        return [];
      }

      return (data || []) as FacultyLeaveApplication[];
    } catch (error) {
      console.error("Error in getFacultyLeaves:", error);
      return [];
    }
  },

  // Get all faculty leave applications (admin only)
  // Note: We do not join profiles here because no FK relationship exists in PostgREST schema cache.
  // Resolve profile details client-side using profiles IDs if needed.
  getAllFacultyLeaves: async (): Promise<FacultyLeaveApplication[]> => {
    try {
      const { data, error } = await supabase
        .from('faculty_leave_applications')
        .select('*')
        .order('applied_on', { ascending: false });

      if (error) {
        console.error("Error fetching all faculty leaves:", error.message);
        return [];
      }

      return (data || []) as FacultyLeaveApplication[];
    } catch (error) {
      console.error("Error in getAllFacultyLeaves:", error);
      return [];
    }
  },

  // Update faculty leave status (admin only)
  updateFacultyLeaveStatus: async (
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    remarks?: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      // Try to resolve approver display name for denormalization
      let approved_by_name: string | null = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', reviewerId)
          .single();
        if (!error && data?.full_name) approved_by_name = data.full_name;
      } catch {}

      const { error } = await supabase
        .from('faculty_leave_applications')
        .update({
          status,
          reviewed_by: reviewerId,
          admin_remarks: remarks,
          approved_by_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', leaveId);

      if (error) {
        console.error("Error updating faculty leave status:", error.message);
        return { success: false, error: error.message };
      }

      // Audit: admin approval/rejection for faculty leave
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: reviewerId,
            action: `${status}_faculty_leave`,
            entity_type: 'faculty_leave_application',
            entity_id: leaveId,
            details: remarks ? { remarks } : null
          });
      } catch {}

      return { success: true, error: null };
    } catch (error) {
      console.error("Error in updateFacultyLeaveStatus:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
};
