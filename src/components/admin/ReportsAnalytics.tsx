import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportStats {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  studentLeaves: number;
  facultyLeaves: number;
}

const ReportsAnalytics = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    studentLeaves: 0,
    facultyLeaves: 0
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data: studentLeaves } = await (supabase as any)
        .from('leave_applications')
        .select('status')
        .gte('applied_on', startDate.toISOString());

      const { data: facultyLeaves } = await (supabase as any)
        .from('faculty_leave_applications')
        .select('status')
        .gte('applied_on', startDate.toISOString());

      const allLeaves = [...(studentLeaves || []), ...(facultyLeaves || [])];

      setStats({
        totalLeaves: allLeaves.length,
        pendingLeaves: allLeaves.filter(l => l.status === 'pending').length,
        approvedLeaves: allLeaves.filter(l => l.status === 'approved').length,
        rejectedLeaves: allLeaves.filter(l => l.status === 'rejected').length,
        studentLeaves: studentLeaves?.length || 0,
        facultyLeaves: facultyLeaves?.length || 0
      });
    } catch (error: any) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const exportToCSV = () => {
    const csvContent = [
      ['Metric', 'Count'],
      ['Total Leaves', stats.totalLeaves],
      ['Pending', stats.pendingLeaves],
      ['Approved', stats.approvedLeaves],
      ['Rejected', stats.rejectedLeaves],
      ['Student Leaves', stats.studentLeaves],
      ['Faculty Leaves', stats.facultyLeaves]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reports & Analytics</h3>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} size="sm"><Download className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalLeaves}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.studentLeaves}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Faculty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.facultyLeaves}</div></CardContent></Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
