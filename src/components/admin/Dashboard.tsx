import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, FileText, BarChart3, History } from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import DashboardStatsCards from "./DashboardStats";
import DashboardCharts from "./DashboardCharts";
import UserManagement from "./UserManagement";
import LeaveManagement from "./LeaveManagement";
import FacultyLeaveManagement from "./FacultyLeaveManagement";
import ReportsAnalytics from "./ReportsAnalytics";
import AuditLogs from "./AuditLogs";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const AdminDashboard = () => {
  const { stats, loading, refreshData, audience, setAudience } = useAdminDashboard();

  return (
  <ErrorBoundary onReset={refreshData}>
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage users, leaves, and view comprehensive analytics
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <DashboardStatsCards stats={stats} loading={loading} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="student-leaves" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Student Leaves
          </TabsTrigger>
          <TabsTrigger value="faculty-leaves" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Faculty Leaves
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DashboardCharts stats={stats} loading={loading} audience={audience} setAudience={setAudience} />
          <ReportsAnalytics />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="student-leaves">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="faculty-leaves">
          <FacultyLeaveManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>
      </Tabs>
    </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
