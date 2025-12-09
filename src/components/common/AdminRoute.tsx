import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AdminRoute = ({ children, fallback }: AdminRouteProps) => {
  const { admin, isAdminAuthenticated } = useAdmin();

  // Debug logging
  console.log("[AdminRoute] Admin state:", { admin, isAdminAuthenticated });

  // Check if admin is authenticated - simplified check
  if (!isAdminAuthenticated) {
    console.log("[AdminRoute] Access denied - not authenticated");
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. This area is restricted to admin users only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("[AdminRoute] Access granted");
  return <>{children}</>;
};

export default AdminRoute;