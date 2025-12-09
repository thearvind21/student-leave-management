
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: ('student' | 'admin' | 'faculty')[];
  fallback?: ReactNode;
}

const RoleBasedRoute = ({ children, allowedRoles, fallback }: RoleBasedRouteProps) => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to access this page. 
              This area is restricted to {allowedRoles.join(', ')} users only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
