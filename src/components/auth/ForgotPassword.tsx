
import Layout from "@/components/layout/Layout";
import AuthForm from "./AuthForm";

const ForgotPassword = () => {
  return (
    <div className="container mx-auto py-10">
      <AuthForm mode="forgot-password" />
    </div>
  );
};

export default ForgotPassword;
