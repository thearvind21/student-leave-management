import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ClipboardList, FileText, BarChart3, Calendar, LineChart } from "lucide-react";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <RoleBasedRoute allowedRoles={['faculty']}>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Faculty Dashboard</h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faculty/leaves')}>
              <CardHeader>
                <ClipboardList className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Student Leave Requests</CardTitle>
                <CardDescription>Review and approve student applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Manage Requests</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faculty/my-leaves')}>
              <CardHeader>
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>My Leave Applications</CardTitle>
                <CardDescription>Apply and track your own leave</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View My Leaves</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faculty/reports')}>
              <CardHeader>
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate student and class reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Reports</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faculty/analytics')}>
              <CardHeader>
                <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View trends and attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faculty/my-analytics')}>
              <CardHeader>
                <LineChart className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>My Leave Analysis</CardTitle>
                <CardDescription>Insights from my applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View My Analysis</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyDashboard;
