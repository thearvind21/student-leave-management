import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { ThemeProvider } from "./context/ThemeProvider";
import { AdminProvider } from "./context/AdminContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminSignup from "./pages/AdminSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import Calendar from "./pages/Calendar";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLeaves from "./pages/admin/Leaves";
import AdminUsers from "./pages/admin/Users";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyLeaves from "./pages/faculty/Leaves";
import FacultyMyLeaves from "./pages/faculty/MyLeaves";
import FacultyAnalytics from "./pages/faculty/Analytics";
import FacultyMyAnalytics from "./pages/faculty/MyAnalytics";
import FacultyReports from "./pages/faculty/Reports";
import StudentDashboard from "./pages/student/Dashboard";
import AdminContacts from "./pages/admin/Contacts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TestAuth from "./pages/TestAuth";
import AdminRoute from "./components/common/AdminRoute";
import Verify from "./pages/Verify";
import Contact from "./pages/Contact";
import Features from "./pages/Features";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles = ['student', 'admin', 'faculty'],
  redirectPath = '/login'
}: {
  children: React.ReactNode,
  allowedRoles?: ('student' | 'admin' | 'faculty')[],
  redirectPath?: string
}) => {
  const { user, userRole, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const FacultyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['faculty']}>{children}</ProtectedRoute>
);

const StaffRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['admin', 'faculty']}>{children}</ProtectedRoute>
);

const StudentRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['student']}>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <AdminProvider>
            <NotificationsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin-signup" element={<AdminSignup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/test-auth" element={<TestAuth />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/features" element={<Features />} />
                  {/* Protected Student Routes */}
                  <Route path="/apply-leave" element={<StudentRoute><ApplyLeave /></StudentRoute>} />
                  <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
                  <Route path="/my-leaves" element={<ProtectedRoute><MyLeaves /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute allowedRoles={['student','faculty']}><Profile /></ProtectedRoute>} />
                  {/* Protected Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/leaves" element={<AdminRoute><AdminLeaves /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="/admin/contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
                  {/* Protected Faculty Routes */}
                  <Route path="/faculty/dashboard" element={<FacultyRoute><FacultyDashboard /></FacultyRoute>} />
                  <Route path="/faculty/leaves" element={<FacultyRoute><FacultyLeaves /></FacultyRoute>} />
                  <Route path="/faculty/my-leaves" element={<FacultyRoute><FacultyMyLeaves /></FacultyRoute>} />
                  <Route path="/faculty/analytics" element={<FacultyRoute><FacultyAnalytics /></FacultyRoute>} />
                  <Route path="/faculty/my-analytics" element={<FacultyRoute><FacultyMyAnalytics /></FacultyRoute>} />
                  <Route path="/faculty/reports" element={<FacultyRoute><FacultyReports /></FacultyRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationsProvider>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;