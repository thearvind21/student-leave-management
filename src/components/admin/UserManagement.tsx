import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, User, GraduationCap, RefreshCw, UserPlus, Trash2, AlertTriangle, Pencil, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { roleService, AppRole } from "@/services/roleService";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  student_id?: string;
  created_at: string;
  role: AppRole;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ full_name: string; email: string; student_id?: string }>({ full_name: '', email: '', student_id: '' });
  const [editRole, setEditRole] = useState<AppRole>('student');
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<'joined-desc' | 'name-asc' | 'name-desc' | 'role'>('joined-desc');
  
  // Form state for adding users
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    student_id: '',
    role: 'student' as AppRole
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles: UserWithRole[] = [];
      
      for (const profile of profiles || []) {
        const role = await roleService.getUserRole(profile.id);
        usersWithRoles.push({
          ...profile,
          role: role || 'student'
        });
      }

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for user changes
  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.password || !newUser.full_name) {
        toast.error("Please fill all required fields");
        return;
      }

      setLoading(true);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            student_id: newUser.student_id
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Assign role
      const { success, error: roleError } = await roleService.assignRole(
        authData.user.id,
        newUser.role
      );

      if (!success) throw new Error(roleError || "Failed to assign role");

      toast.success("User created successfully");
      setAddDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        student_id: '',
        role: 'student'
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, oldRole: AppRole, newRole: AppRole) => {
    try {
      setUpdating(userId);

      // Remove old role
      await roleService.removeRole(userId, oldRole);

      // Assign new role
      const { success, error } = await roleService.assignRole(userId, newRole);
      
      if (success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error(error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("An error occurred while updating the role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      // Delete user profile (auth.users will cascade delete via RLS)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: UserWithRole) => {
    setSelectedUser(u);
    setEditForm({ full_name: u.full_name, email: u.email, student_id: u.student_id || '' });
    setEditRole(u.role);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          student_id: editForm.student_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      if (error) throw error;
      // Update role in same save if changed
      if (editRole !== selectedUser.role) {
        await roleService.removeRole(selectedUser.id, selectedUser.role);
        const { success, error: roleErr } = await roleService.assignRole(selectedUser.id, editRole);
        if (!success) throw new Error(roleErr || 'Failed to update role');
      }
      toast.success('User updated');
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (e: any) {
      console.error('Error updating user:', e);
      toast.error(e.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort derived list
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users;
    if (q) {
      list = list.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.student_id || '').toString().toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'name-asc':
        list = [...list].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
        break;
      case 'role':
        list = [...list].sort((a, b) => (a.role || '').localeCompare(b.role || ''));
        break;
      case 'joined-desc':
      default:
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [users, query, sortBy]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'faculty':
        return <GraduationCap className="h-4 w-4" />;
      case 'student':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'faculty':
        return 'default';
      case 'student':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage users, assign roles, and control access permissions
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative hidden md:block">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 w-64"
              placeholder="Search name, email, ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="joined-desc">Newest</SelectItem>
              <SelectItem value="name-asc">Name A–Z</SelectItem>
              <SelectItem value="name-desc">Name Z–A</SelectItem>
              <SelectItem value="role">Role</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All role changes are tracked in audit logs. Be careful when assigning admin privileges.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.student_id || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole: AppRole) => handleRoleUpdate(user.id, user.role, newRole)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating === user.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(user)}
                        title="Edit details"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@school.edu"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="student_id">Student/Employee ID</Label>
              <Input
                id="student_id"
                value={newUser.student_id}
                onChange={(e) => setNewUser({ ...newUser, student_id: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(role: AppRole) => setNewUser({ ...newUser, role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update basic details for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input id="edit_full_name" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input id="edit_email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit_student_id">Student/Employee ID</Label>
              <Input id="edit_student_id" value={editForm.student_id} onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
