
import Layout from "@/components/layout/Layout";
import AdminSignup from "@/components/auth/AdminSignup";

const AdminSignupPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <AdminSignup />
      </div>
    </Layout>
  );
};

export default AdminSignupPage;
