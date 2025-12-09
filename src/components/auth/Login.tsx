import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, LogIn, Key, Loader2, AlertTriangle, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminService } from "@/services/adminService";

const Login = () => {
  const [tab, setTab] = useState<"student" | "faculty" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { login, profile, loading } = useAuth();
  const { setAdmin } = useAdmin();
  const navigate = useNavigate();

  // Reset error when switching tabs
  const handleTabChange = (newTab: string) => {
    setTab(newTab as "student" | "faculty" | "admin");
    setError(null);
  };

  // Helper to wait for the user profile to load
  async function waitForProfile(timeoutMs = 5000): Promise<boolean> {
    const start = Date.now();
    while (!profile && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return !!profile;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === "admin") {
        // Admin login via admin_users table
        const { admin, error: adminError } = await adminService.login(email, password);

        if (adminError) {
          setError(adminError);
          setIsLoading(false);
          return;
        }
        if (!admin) {
          setError("Invalid admin credentials.");
          setIsLoading(false);
          return;
        }
        // Store admin in context and localStorage
        setAdmin(admin);
        console.log("[Login] Admin set in context, redirecting to dashboard...");
        // Success: redirect to admin dashboard!
        setIsLoading(false);
        navigate("/admin/dashboard", { replace: true });
        console.log("[Login] Navigate called with /admin/dashboard");
        return;
      }

      if (tab === "faculty") {
        // Faculty login via Supabase Auth with role validation
        await login(email, password, 'faculty');
        const profileLoaded = await waitForProfile();

        if (!profileLoaded) {
          setError("Profile could not be loaded. Please try again.");
          setIsLoading(false);
          return;
        }

        console.log("[Login] Faculty login successful, redirecting to dashboard...");
        navigate("/faculty/dashboard", { replace: true });
        return;
      }

      // Student flow (default Supabase Auth)
      await login(email, password);
      // Wait until profile loads (this will usually take a moment)
      const profileLoaded = await waitForProfile();

      if (!profileLoaded) {
        setError("Profile could not be loaded. Please try again.");
        setIsLoading(false);
        return;
      }

      // Student tab - redirect to student dashboard
      console.log("[Login] Student login successful, redirecting to dashboard...");
      navigate("/student/dashboard", { replace: true });

    } catch (err: any) {
      setError(
        err?.message ||
        "Failed to sign in. Please check your credentials or try again."
      );
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <Card className="w-full max-w-md mx-auto shadow-lg border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="student" className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>Student</span>
              </TabsTrigger>
              <TabsTrigger value="faculty" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Faculty</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-1.5">
                <Key className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
            {/* Error display */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="student@example.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full flex items-center gap-1.5 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                  <span>Login as Student</span>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="faculty">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="faculty-email">Email</Label>
                  <Input
                    id="faculty-email"
                    placeholder="faculty@paruluniversity.ac.in"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="faculty-password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="faculty-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <Checkbox
                    id="faculty-remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="faculty-remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full flex items-center gap-1.5 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                  <span>Login as Faculty</span>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    placeholder="admin@school.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admin-password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <Checkbox
                    id="admin-remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="admin-remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full flex items-center gap-1.5 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                  <span>Login as Admin</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
