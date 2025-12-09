import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import LeaveHistory from "@/components/leave/LeaveHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LeaveApplicationForm from "@/components/leave/LeaveApplicationForm";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { leaves, loading, formatDate } = useLeaveHistory();
  const { profile } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);

  // Summary counts and monthly aggregation
  const summary = useMemo(() => {
    const approved = leaves.filter((l) => l.status === "approved").length;
    const rejected = leaves.filter((l) => l.status === "rejected").length;
    const pending = leaves.filter((l) => l.status === "pending").length;

    const today = new Date();
    const upcomingList = leaves
      .filter((l) => {
        const sd = new Date(l.start_date);
        return (
          sd >= new Date(today.getFullYear(), today.getMonth(), today.getDate()) &&
          l.status !== "rejected"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );

    // last 6 months buckets
    const months: { name: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = d.toLocaleString("default", { month: "short" });
      months.push({ name, value: 0 });
    }

    leaves.forEach((l) => {
      const sd = new Date(l.start_date);
      const ed = new Date(l.end_date);
      const days = Math.max(
        1,
        Math.round((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      const monthIdx = months.findIndex((m, i) => {
        const now = new Date();
        now.setMonth(now.getMonth() - (5 - i));
        return (
          now.getMonth() === sd.getMonth() && now.getFullYear() === sd.getFullYear()
        );
      });
      if (monthIdx >= 0) months[monthIdx].value += days;
    });

    return { approved, rejected, pending, upcomingList, months };
  }, [leaves]);

  return (
    <Layout>
      <RoleBasedRoute allowedRoles={["student"]}>
        <div className="container mx-auto py-8 px-4">
          {/* Header with CTA and profile progress */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900/80 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-white/80">
                Student Dashboard
              </h1>
              <p className="text-muted-foreground">Overview of your recent activity and leaves.</p>
            </div>
            <div className="flex items-center gap-4">
          
              <Button
                onClick={() => setApplyOpen(true)}
                className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/40 hover:brightness-110 active:scale-[.98]"
              >
                <Plus className="mr-2" /> Apply Leave
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/my-leaves')}
                className="border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <FileText className="mr-2" /> My Leaves
              </Button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <Card className="p-4 border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.upcomingList.length > 0 ? (
                  <div>
                    <p className="font-medium">Next: {summary.upcomingList[0].leave_type}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(summary.upcomingList[0].start_date)} — {formatDate(summary.upcomingList[0].end_date)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming leaves</p>
                )}
              </CardContent>
            </Card>

            <Card className="p-4 border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.pending}</p>
                <p className="text-sm text-muted-foreground">Pending requests</p>
              </CardContent>
            </Card>

            <Card className="p-4 border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-lg font-semibold text-green-600">{summary.approved}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{summary.rejected}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                </div>
                <div className="mt-4 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.months} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis hide />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#grad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leave history */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">My Leave History</h2>
            <LeaveHistory />
          </div>
        </div>
        {/* Apply Leave Modal */}
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent className="max-w-3xl w-[95vw] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-auto px-4 pb-6">
              <LeaveApplicationForm onSuccess={() => setApplyOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </RoleBasedRoute>
    </Layout>
  );
};

export default StudentDashboard;
