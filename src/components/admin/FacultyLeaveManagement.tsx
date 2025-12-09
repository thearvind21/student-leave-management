import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Eye, RefreshCw, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LeavePdfTemplate from "@/components/admin/LeavePdfTemplate";
import { createRoot } from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { adminService } from "@/services/adminService";

interface FacultyLeave {
  id: string;
  faculty_id: string;
  faculty_name?: string;
  faculty_email?: string;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_on: string;
  reviewed_by?: string;
  admin_remarks?: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

const FacultyLeaveManagement = () => {
  const [leaves, setLeaves] = useState<FacultyLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<FacultyLeave | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { isAdminAuthenticated } = useAdmin();

  const fetchFacultyLeaves = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculty_leave_applications')
        .select('*')
        .order('applied_on', { ascending: false });

      if (error) throw error;

      const list: FacultyLeave[] = (data as any) || [];
      // Resolve faculty names/emails via profiles
      const ids = Array.from(new Set(list.map(l => l.faculty_id))).filter(Boolean) as string[];
      const profileMap = await supabaseService.getProfilesByIds(ids);
      const withProfiles = list.map(l => ({
        ...l,
        profile: profileMap[l.faculty_id] ? {
          full_name: profileMap[l.faculty_id].full_name,
          email: profileMap[l.faculty_id].email
        } : undefined
      }));

      setLeaves(withProfiles);
    } catch (error: any) {
      console.error("Error fetching faculty leaves:", error);
      toast.error("Failed to load faculty leave applications");
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchFacultyLeaves();

    const channel = supabase
      .channel('faculty-leave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'faculty_leave_applications'
        },
        () => {
          fetchFacultyLeaves();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReview = async (status: 'approved' | 'rejected') => {
    // Allow if a leave is selected; either a Supabase-auth user (faculty/admin) exists OR admin context is authenticated
    if (!selectedLeave) return;
    if (!user && !isAdminAuthenticated) return;

    try {
      setProcessing(true);

      // Try to resolve approver display name (Supabase user profile or AdminContext fallback)
      let approverName: string | null = null;
      if (user?.id) {
        try {
          const map = await supabaseService.getProfilesByIds([user.id]);
          approverName = map[user.id]?.full_name || null;
        } catch {}
      }
      if (!approverName && isAdminAuthenticated) {
        // AdminContext: try to read stored admin name from localStorage
        try {
          const raw = localStorage.getItem('admin_user');
          if (raw) approverName = (JSON.parse(raw)?.full_name as string) || null;
        } catch {}
      }

      const { error } = await supabase
        .from('faculty_leave_applications')
        .update({
          status,
          reviewed_by: user?.id || null,
          admin_remarks: comments,
          approved_by_name: approverName,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLeave.id);

      if (error) throw error;

      // Log audit
      // Best-effort audit log; may fail due to RLS if not allowed
      const { error: auditErr } = await supabase.from('audit_logs').insert({
        user_id: user?.id || null,
        action: `${status}_faculty_leave`,
        entity_type: 'faculty_leave_application',
        entity_id: selectedLeave.id,
        details: { admin_remarks: comments }
      });
      if (auditErr) {
        console.debug('Audit log insert failed (non-blocking):', auditErr.message);
      }

      toast.success(`Faculty leave ${status}`);
      setReviewDialogOpen(false);
      setComments('');
      setSelectedLeave(null);
      fetchFacultyLeaves();
    } catch (error: any) {
      console.error("Error reviewing leave:", error);
      toast.error(error.message || "Failed to review leave");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // One-click repair: fill missing approver names on existing rows
  const fixMissingApproverNames = async () => {
    try {
      const raw = localStorage.getItem('admin_user');
      const adminName = raw ? (JSON.parse(raw)?.full_name as string) : '';
      if (!adminName) {
        toast.error('No admin name found. Please log in via Admin panel.');
        return;
      }
      const { error } = await supabase
        .from('faculty_leave_applications')
        .update({ approved_by_name: adminName, updated_at: new Date().toISOString() })
        .is('approved_by_name', null)
        .in('status', ['approved','rejected']);
      if (error) throw error;
      toast.success('Missing approver names filled');
      fetchFacultyLeaves();
    } catch (e: any) {
      console.error('Fix approver names failed', e);
      toast.error(e?.message || 'Failed to fill approver names');
    }
  };

  const downloadFacultyPdf = async (leave: FacultyLeave) => {
    try {
      // Resolve approver display name if reviewed_by present
      let approverName = leave as any as any;
      // Safely coerce to access field if present
      // prefer denormalized name
      // @ts-ignore
      approverName = (leave as any).approved_by_name || "";
      if (!approverName && leave.reviewed_by) {
        const map = await supabaseService.getProfilesByIds([leave.reviewed_by]);
        approverName = map[leave.reviewed_by]?.full_name || "";
      }
      const approver = { name: approverName, id: "", role: "" } as any;

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '210mm';
      document.body.appendChild(container);

      const wrapper = document.createElement('div');
      wrapper.id = 'faculty-admin-pdf-wrapper';
      container.appendChild(wrapper);

      const root = createRoot(wrapper);
      const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const leaveForTemplate: any = { ...leave };
      root.render(<LeavePdfTemplate leave={leaveForTemplate} approver={approver} mode={mode as any} />);

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const target = wrapper as HTMLDivElement;
      if (!target) throw new Error('PDF container not found');

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: mode === 'dark' ? '#18181b' : '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210; const pageHeight = 297;
      const props = pdf.getImageProperties(imgData);
      let pdfWidth = pageWidth; let pdfHeight = (props.height * pdfWidth) / props.width;
      if (pdfHeight > pageHeight) { pdfHeight = pageHeight; pdfWidth = (props.width * pdfHeight) / props.height; }
      pdf.addImage(imgData, 'PNG', (pageWidth - pdfWidth) / 2, 10, pdfWidth, pdfHeight);

      const name = leave.faculty_name || leave.profile?.full_name || 'faculty';
      pdf.save(`faculty_leave_${name}_${leave.id}.pdf`);

      root.unmount();
      document.body.removeChild(container);
    } catch (e) {
      console.error('Faculty PDF generation failed', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading faculty leaves...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Faculty Leave Applications</h3>
          <p className="text-sm text-muted-foreground">
            Review and approve faculty leave requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFacultyLeaves} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={fixMissingApproverNames} variant="outline" size="sm">
            Fill Missing Approver Names
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Faculty Leaves ({leaves.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No faculty leave applications found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.faculty_name || leave.profile?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{leave.leave_type}</TableCell>
                    <TableCell>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.applied_on).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setComments(leave.admin_remarks || '');
                            setReviewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        {leave.status !== 'pending' && (
                          <Button variant="outline" size="sm" onClick={() => downloadFacultyPdf(leave)}>
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Faculty Leave Application</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject the leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Faculty Name</Label>
                  <p className="font-medium">{selectedLeave.faculty_name || selectedLeave.profile?.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedLeave.faculty_email || selectedLeave.profile?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Leave Type</Label>
                  <p className="font-medium">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedLeave.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{new Date(selectedLeave.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="font-medium">{new Date(selectedLeave.end_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium mt-1">{selectedLeave.reason}</p>
              </div>

              {selectedLeave.status === 'pending' && (
                <div>
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments or remarks..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedLeave?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReview('rejected')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
              </>
            ) : (
              <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyLeaveManagement;