
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type FormMode = "login" | "signup" | "forgot-password";

interface AuthFormProps {
  mode: FormMode;
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const { login, signup, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Simple validation
    if (mode === "login" && (!email || !password)) {
      setError("Please enter both email and password");
      return;
    }

    if (mode === "signup" && (!email || !password || !name)) {
      setError("Please fill in all required fields");
      return;
    }

    if (mode === "forgot-password" && !email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        await login(email, password);
        navigate("/"); // Redirect to home page after login
      } else if (mode === "signup") {
        await signup(name, email, password, avatarFile ?? undefined);
        navigate("/login"); // Redirect to login page after signup
      } else if (mode === "forgot-password") {
        await resetPassword(email);
        setSuccess("Password reset email has been sent. Please check your inbox.");
        setEmail("");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const getTitle = () => {
    switch (mode) {
      case "login": return "Login";
      case "signup": return "Create an Account";
      case "forgot-password": return "Reset Password";
      default: return "Authentication";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login": return "Enter your credentials to access your account";
      case "signup": return "Fill in your details to create a new account";
      case "forgot-password": return "Enter your email to receive a password reset link";
      default: return "";
    }
  };

  const inputClass = "h-11 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">{getTitle()}</CardTitle>
        <CardDescription className="text-center text-slate-600 dark:text-slate-400">{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center border">
                    {avatarPreview ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img src={avatarPreview} alt="Profile picture preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">PNG/JPG up to ~2MB recommended.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className={inputClass}
            />
          </div>

          {mode !== "forgot-password" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className={inputClass}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Logging in..." : mode === "signup" ? "Signing up..." : "Submitting..."}
              </>
            ) : (
              mode === "login" ? "Login" : mode === "signup" ? "Sign Up" : "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline">
                Sign up
              </Link>
            </>
          ) : mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline">
                Login
              </Link>
            </>
          ) : (
            <>
              Remember your password?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline">
                Login
              </Link>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
