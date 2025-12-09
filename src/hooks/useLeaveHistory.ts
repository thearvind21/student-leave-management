
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { LeaveApplication, supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLeaveHistory = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const { user, isAdmin, isFaculty } = useAuth();
  const { isAdminAuthenticated } = useAdmin();

  const fetchLeaves = async () => {
    try {
      // Allow admin via AdminContext to manage without Supabase user
      setLoading(true);
      let fetchedLeaves: LeaveApplication[] = [];
      
      // Fetch leaves based on role or admin context
      if (isAdminAuthenticated || isAdmin() || isFaculty()) {
        // For admin or faculty, fetch all leaves
        fetchedLeaves = await supabaseService.getAllLeaves();
      } else {
        if (!user) {
          // Not logged in and not admin – nothing to show
          setLeaves([]);
          setFilteredLeaves([]);
          return;
        }
        // For students, fetch only their leaves
        fetchedLeaves = await supabaseService.getStudentLeaves(user.id);
      }
      
      setLeaves(fetchedLeaves);
      setFilteredLeaves(fetchedLeaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leave applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || isAdminAuthenticated) {
      fetchLeaves();

      // Subscribe to real-time updates for leave applications
      const channel = supabase
        .channel('leave-history-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leave_applications'
          },
          () => {
            fetchLeaves();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Not logged in and not admin – stop loading state
      setLoading(false);
    }
  }, [user, isAdminAuthenticated]);

  useEffect(() => {
    // Filter leaves based on search query and status filter
    let filtered = leaves;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leave_type.toLowerCase().includes(query) ||
        leave.reason.toLowerCase().includes(query) ||
        new Date(leave.start_date).toLocaleDateString().includes(query) ||
        new Date(leave.end_date).toLocaleDateString().includes(query)
      );
    }
    
    setFilteredLeaves(filtered);
  }, [searchQuery, statusFilter, leaves]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const refreshLeaves = () => {
    fetchLeaves();
  };

  return {
    leaves: filteredLeaves,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    formatDate,
    hasFilters: searchQuery !== "" || statusFilter !== "all",
    refreshLeaves
  };
};
