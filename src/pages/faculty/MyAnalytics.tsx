import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import MyLeaveAnalytics from "@/components/faculty/MyLeaveAnalytics";

const FacultyMyAnalyticsPage = () => {
  return (
    <Layout>
      <RoleBasedRoute allowedRoles={["faculty"]}>
        <h1 className="text-2xl font-bold mb-6">My Leave Analysis</h1>
        <MyLeaveAnalytics />
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyMyAnalyticsPage;
