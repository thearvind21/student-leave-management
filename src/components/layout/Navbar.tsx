import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, BookOpen, CalendarCheck, Users, Shield, BarChart3, Mail } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Profile from "@/pages/Profile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    profile,
    logout,
    isAdmin,
    isFaculty,
    isStudent
  } = useAuth();
  const {
    admin,
    isAdminAuthenticated,
    logout: adminLogout
  } = useAdmin();
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (isAdminAuthenticated) {
      adminLogout();
    } else {
      await logout();
    }
    navigate("/login");
  };

  // Check if any user is authenticated (regular user or admin)
  const isAuthenticated = user || isAdminAuthenticated;
  const currentUser = admin || profile;
  const [profileOpen, setProfileOpen] = useState(false);
  return <header className="bg-card border-b sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="#" className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6" />
            <span className="hidden md:inline-block">LeaveApp</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? <>
              {isStudent() && <>
                  <Link to="/student/dashboard" className="text-sm font-medium transition-colors hover:text-foreground/80">
                    Dashboard
                  </Link>
                  
                </>}
              {(isAdmin() || isAdminAuthenticated) && <>
                  <Link to="/admin/dashboard" className="text-sm font-medium transition-colors hover:text-foreground/80">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/admin/contacts" className="text-sm font-medium transition-colors hover:text-foreground/80">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Demo Requests
                  </Link>
                  
                  
                </>}
              {isFaculty() && <>
                  <Link to="/faculty/dashboard" className="text-sm font-medium transition-colors hover:text-foreground/80">
                    Dashboard
                  </Link>
                  <Link to="/faculty/leaves" className="text-sm font-medium transition-colors hover:text-foreground/80">
                    Manage Leaves
                  </Link>
                 
                </>}
              <NotificationCenter />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent hover:text-accent-foreground transition-colors">
                    {isAdminAuthenticated && <Shield className="h-4 w-4 text-blue-600" />}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(isAdminAuthenticated ? (admin as any)?.avatar_url : profile?.avatar_url) || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>{(isAdminAuthenticated ? admin?.full_name : profile?.full_name)?.slice(0,1) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[10rem] truncate">
                      {isAdminAuthenticated ? admin?.full_name : profile?.full_name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setProfileOpen(true); }}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout(); }} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </> : <>
              <ThemeToggle />
              <Link to="/login">
                <Button size="sm" className="ml-2">Login</Button>
              </Link>
            </>}
        </nav>

        {/* Mobile Menu */}
        {isMobile && <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationCenter />}
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="border-b pb-5 mb-5">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  {isAuthenticated ? <>
                      <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-2">
                          {isAdminAuthenticated && <Shield className="h-5 w-5 text-blue-600" />}
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isAdminAuthenticated ? admin?.full_name : profile?.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isAdminAuthenticated ? admin?.email : profile?.email}
                          </p>
                          {isAdminAuthenticated && <p className="text-xs text-blue-600 font-medium">Administrator</p>}
                        </div>
                      </div>
                      {isStudent() && <>
                          <SheetClose asChild>
                            <Link to="/student/dashboard" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <BookOpen className="mr-2 h-5 w-5" />
                              Dashboard
                            </Link>
                          </SheetClose>
                          <button
                            className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80 text-left"
                            onClick={() => {
                              setIsOpen(false);
                              setProfileOpen(true);
                            }}
                          >
                            <User className="mr-2 h-5 w-5" />
                            My Profile
                          </button>
                      
                        </>}
                      {(isAdmin() || isAdminAuthenticated) && <>
                          <SheetClose asChild>
                            <Link to="/admin/dashboard" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <Shield className="mr-2 h-5 w-5 text-blue-600" />
                              Admin Dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/admin/leaves" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <CalendarCheck className="mr-2 h-5 w-5" />
                              Manage Leaves
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/admin/users" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <Users className="mr-2 h-5 w-5" />
                              User Management
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/admin/contacts" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <Mail className="mr-2 h-5 w-5" />
                              Demo Requests
                            </Link>
                          </SheetClose>
                        </>}
                      {isFaculty() && <>
                          <SheetClose asChild>
                            <Link to="/faculty/dashboard" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <BookOpen className="mr-2 h-5 w-5" />
                              Dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link to="/faculty/leaves" className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80" onClick={() => setIsOpen(false)}>
                              <CalendarCheck className="mr-2 h-5 w-5" />
                              Manage Leaves
                            </Link>
                          </SheetClose>
                          <button
                            className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80 text-left"
                            onClick={() => {
                              setIsOpen(false);
                              setProfileOpen(true);
                            }}
                          >
                            <User className="mr-2 h-5 w-5" />
                            My Profile
                          </button>
                        </>}
                      <Button variant="destructive" className="mt-4" onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </> : <>
                      <SheetClose asChild>
                        <Link
                          to="/login"
                          className="flex items-center py-2 font-medium transition-colors hover:text-foreground/80"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          Login
                        </Link>
                      </SheetClose>
                    </>}
                </div>
              </SheetContent>
            </Sheet>
          </div>}
      </div>
      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-[480px] w-[90vw] p-0 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 shadow-2xl">
          <div className="max-h-[90vh] overflow-hidden px-4 pb-4 pt-2">
            <Profile />
          </div>
        </DialogContent>
      </Dialog>
    </header>;
};
export default Navbar;