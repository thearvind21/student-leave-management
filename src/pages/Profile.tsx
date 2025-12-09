import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { adminService } from "@/services/adminService";
import { supabaseService } from "@/services/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Eye, EyeOff, Upload, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Profile = () => {
  const { user, profile } = useAuth();
  const { admin, isAdminAuthenticated, setAdmin } = useAdmin();
  const [fullName, setFullName] = useState(() => (isAdminAuthenticated ? (admin?.full_name || "") : (profile?.full_name || "")));
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [avatarUrl, setAvatarUrl] = useState(() => (isAdminAuthenticated ? (admin?.avatar_url || "") : (profile?.avatar_url || "")));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const isStudent = profile?.role === "student";
  const isFaculty = profile?.role === "faculty";
  const isAdminUser = isAdminAuthenticated && !user; // AdminContext-only flow

  const onSaveProfile = async () => {
    // Admin profile update path (no Supabase auth user)
    if (isAdminUser && admin) {
      try {
        setSaving(true);
        let newAvatarUrl = avatarUrl;
        if (avatarFile) {
          // Try to upload to public storage using admin id as folder
          const { url, error } = await supabaseService.uploadProfileAvatar(avatarFile, admin.id);
          if (error) {
            // Allow name update even if avatar upload fails
            toast.warning?.(typeof error === 'string' ? error : 'Avatar upload failed; saving name only');
          } else if (url) {
            newAvatarUrl = url;
          }
        }

        const { success, error } = await adminService.updateProfile(admin.id, { full_name: fullName, avatar_url: newAvatarUrl });
        if (!success) throw new Error(error || 'Failed to update admin profile');
        setAvatarUrl(newAvatarUrl);
        // Update AdminContext so navbar/avatar reflects changes
        setAdmin({ ...admin, full_name: fullName, avatar_url: newAvatarUrl } as any);
        toast.success('Profile updated');
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 600);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to update profile');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!user) return;
    try {
      setSaving(true);
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const { url, error } = await supabaseService.uploadProfileAvatar(avatarFile, user.id);
        if (error) throw new Error(error);
        if (url) newAvatarUrl = url;
      }

  const update: any = { full_name: fullName, avatar_url: newAvatarUrl };
  // Student ID is not editable by students; do not include it in updates
      if (isFaculty) update.department = department;

      const { success, error } = await supabaseService.updateProfile(user.id, update);
      if (!success) throw new Error(error || "Failed to update profile");

      setAvatarUrl(newAvatarUrl);
  toast.success("Profile updated");
  setJustSaved(true);
  setTimeout(() => setJustSaved(false), 600);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setChangingPwd(true);
      const { success, error } = await supabaseService.changePassword(newPassword);
      if (!success) throw new Error(error || "Failed to change password");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile details */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900/80 dark:to-slate-900/40 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-2xl">My Profile</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Update your personal information and avatar.</p>
          </div>
        </CardHeader>
  <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-lg shadow-sky-200/30">
              <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-slate-900">
                <AvatarImage src={avatarUrl} alt={fullName || "User"} />
                <AvatarFallback>{(fullName || "U").slice(0,1)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-full">
              <Label className="mb-1 block">Change picture</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[.98] backdrop-blur-sm"
                >
                  <Upload className="h-4 w-4" /> Choose File
                </Button>
                <span className="text-xs text-muted-foreground truncate max-w-[50%]">
                  {avatarFile?.name || "No file chosen"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">PNG/JPG up to ~2MB recommended.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" />
            </div>
            {isStudent && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sid">Student ID</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Assigned by admin</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input id="sid" value={studentId} disabled readOnly className="h-11 bg-slate-50 dark:bg-slate-900/40" />
              </div>
            )}
            {isFaculty && (
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} className="h-11" />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSaveProfile}
              disabled={saving}
              className={`min-w-32 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/40 hover:brightness-110 active:scale-[.98] ${justSaved ? 'animate-pulse' : ''}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Inline security section within the same card (hide for AdminContext-only) */}
          {!isAdminUser && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">Manage your password.</p>
              </div>
              <Button variant="outline" onClick={() => setPwdOpen(v => !v)}>
                {pwdOpen ? "Close" : "Change Password"}
              </Button>
            </div>

            {pwdOpen && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pwd1">New Password</Label>
                    <div className="relative">
                      <Input id="pwd1" type={showPwd ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 pr-10" />
                      <button type="button" aria-label="Toggle password" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPwd(v => !v)}>
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pwd2">Confirm Password</Label>
                    <div className="relative">
                      <Input id="pwd2" type={showConfirmPwd ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 pr-10" />
                      <button type="button" aria-label="Toggle password" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPwd(v => !v)}>
                        {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={onChangePassword} disabled={changingPwd} className="min-w-40">
                    {changingPwd ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};

export default Profile;
