import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import LeaveManagement from "@/components/admin/LeaveManagement";

const FacultyLeavesPage = () => {
  return (
    <Layout>
      <RoleBasedRoute allowedRoles={['faculty', 'admin']}>
        <h1 className="text-2xl font-bold mb-6">Student Leave Management</h1>
        <LeaveManagement />
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyLeavesPage;
