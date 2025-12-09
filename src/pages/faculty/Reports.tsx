import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import FacultyReports from "@/components/faculty/Reports";

const FacultyReportsPage = () => {
  return (
    <Layout>
      <RoleBasedRoute allowedRoles={["faculty"]}>
        <h1 className="text-2xl font-bold mb-6">Faculty Reports</h1>
        <FacultyReports />
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyReportsPage;
