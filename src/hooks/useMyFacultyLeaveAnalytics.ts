import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { facultyLeaveService, FacultyLeaveApplication } from "@/services/facultyLeaveService";

interface ChartPoint { name: string; value: number; }
interface PiePoint { name: string; value: number; percentage?: number; }

export const useMyFacultyLeaveAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<FacultyLeaveApplication[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        if (!user?.id) {
          setLeaves([]);
          return;
        }
        const data = await facultyLeaveService.getFacultyLeaves(user.id);
        setLeaves(data);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = leaves.length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    const pending = leaves.filter(l => l.status === 'pending').length;

    // Monthly trend by applied_on month (last 6 months)
    const byMonth = new Map<string, number>();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    leaves.forEach(l => {
      const d = new Date(l.applied_on);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      byMonth.set(key, (byMonth.get(key) || 0) + 1);
    });
    const monthlyData: ChartPoint[] = Array.from(byMonth.entries())
      .sort((a, b) => {
        const [ma, ya] = a[0].split(' ');
        const [mb, yb] = b[0].split(' ');
        const order = (y: string, m: string) => parseInt(y) * 12 + months.indexOf(m);
        return order(ya, ma) - order(yb, mb);
      })
      .slice(-6)
      .map(([name, value]) => ({ name, value }));

    // Status breakdown
    const statusData: PiePoint[] = [
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected },
      { name: 'Pending', value: pending }
    ];
    const statusWithPct = statusData.map(s => ({
      ...s,
      percentage: total ? Math.round((s.value / total) * 100) : 0
    }));

    // Types breakdown
    const typeCount = new Map<string, number>();
    leaves.forEach(l => typeCount.set(l.leave_type, (typeCount.get(l.leave_type) || 0) + 1));
    const typeData: ChartPoint[] = Array.from(typeCount.entries()).map(([name, value]) => ({ name, value }));

    return {
      total,
      approved,
      rejected,
      pending,
      monthlyData,
      statusData: statusWithPct,
      typeData
    };
  }, [leaves]);

  return { loading, stats };
};

export type MyFacultyLeaveAnalytics = ReturnType<typeof useMyFacultyLeaveAnalytics>;
