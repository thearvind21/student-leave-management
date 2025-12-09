import { useEffect, useState } from "react";
import { supabaseService, LeaveApplication } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface FacultyAnalyticsStats {
  // Counts scoped to the faculty member's actions
  myReviewedLeaves: number;
  myApprovedLeaves: number;
  myRejectedLeaves: number;
  // Queue awareness (global pending for visibility)
  totalPendingLeaves: number;
  // Chart data
  monthlyReviewedData: Array<{ name: string; value: number }>;
  statusData: Array<{ name: string; value: number; percentage: number }>;
  typeData: Array<{ name: string; value: number }>;
  // Recent activity
  recentReviewed: LeaveApplication[];
}

export const useFacultyAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FacultyAnalyticsStats>({
    myReviewedLeaves: 0,
    myApprovedLeaves: 0,
    myRejectedLeaves: 0,
    totalPendingLeaves: 0,
    monthlyReviewedData: [],
    statusData: [],
    typeData: [],
    recentReviewed: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const leaves = await supabaseService.getAllLeaves();

      // Scope: leaves reviewed by this faculty
      const myReviewed = leaves.filter(l => l.reviewed_by === user.id && (l.status === 'approved' || l.status === 'rejected'));
      const myApproved = myReviewed.filter(l => l.status === 'approved');
      const myRejected = myReviewed.filter(l => l.status === 'rejected');

      const totalPending = leaves.filter(l => l.status === 'pending').length;

      const monthlyReviewedData = generateMonthlyData(myReviewed);
      const statusData = [
        {
          name: 'Approved',
          value: myApproved.length,
          percentage: myReviewed.length > 0 ? Math.round((myApproved.length / myReviewed.length) * 100) : 0,
        },
        {
          name: 'Rejected',
          value: myRejected.length,
          percentage: myReviewed.length > 0 ? Math.round((myRejected.length / myReviewed.length) * 100) : 0,
        },
      ];

      const typeData = generateTypeData(myReviewed);
      const recentReviewed = myReviewed.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 10);

      setStats({
        myReviewedLeaves: myReviewed.length,
        myApprovedLeaves: myApproved.length,
        myRejectedLeaves: myRejected.length,
        totalPendingLeaves: totalPending,
        monthlyReviewedData,
        statusData,
        typeData,
        recentReviewed,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Real-time updates on leave changes
    const channel = supabase
      .channel('faculty-analytics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_applications' },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const refresh = () => fetchAnalytics();

  return { stats, loading, refresh };
};

function generateMonthlyData(leaves: LeaveApplication[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const monthlyCount: { [key: string]: number } = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    monthlyCount[key] = 0;
  }

  leaves.forEach(leave => {
    const date = new Date(leave.updated_at || leave.applied_on);
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (monthlyCount[key] !== undefined) monthlyCount[key]++;
  });

  return Object.entries(monthlyCount).map(([name, value]) => ({ name, value }));
}

function generateTypeData(leaves: LeaveApplication[]) {
  const map: Record<string, number> = {};
  leaves.forEach(l => {
    const type = l.leave_type || 'Other';
    map[type] = (map[type] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
