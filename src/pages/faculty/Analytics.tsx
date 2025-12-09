import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import FacultyAnalytics from "@/components/faculty/Analytics";

const FacultyAnalyticsPage = () => {
  return (
    <Layout>
      <RoleBasedRoute allowedRoles={["faculty"]}>
        <h1 className="text-2xl font-bold mb-6">Faculty Analytics</h1>
        <FacultyAnalytics />
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyAnalyticsPage;
