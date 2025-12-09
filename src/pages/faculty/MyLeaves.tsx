import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import RoleBasedRoute from "@/components/common/RoleBasedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { facultyLeaveService } from "@/services/facultyLeaveService";
import { toast } from "sonner";
import { Calendar, FileUp, Loader2, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LeavePdfTemplate from "@/components/admin/LeavePdfTemplate";
import { createRoot } from "react-dom/client";
import { supabaseService } from "@/services/supabaseService";

const FacultyMyLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [reviewers, setReviewers] = useState<Record<string, { full_name: string; email: string; role?: string }>>({});

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    if (!user) return;
    setLoading(true);
    const data = await facultyLeaveService.getFacultyLeaves(user.id);
    setLeaves(data);
    setLoading(false);
  };

  // Resolve reviewer names for approved/rejected leaves
  const reviewerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const l of leaves) {
      if (l.reviewed_by) ids.add(l.reviewed_by);
    }
    return Array.from(ids);
  }, [leaves]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (reviewerIds.length === 0) return;
      const map = await supabaseService.getProfilesByIds(reviewerIds);
      if (!ignore) setReviewers(map);
    };
    run();
    return () => { ignore = true; };
  }, [reviewerIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      let attachmentUrl: string | undefined;

      if (attachmentFile) {
        const { url, error } = await supabaseService.uploadAttachment(attachmentFile, user.id);
        if (error) {
          toast.error(`Failed to upload attachment: ${error}`);
          return;
        }
        attachmentUrl = url || undefined;
      }

      const { data, error } = await facultyLeaveService.submitFacultyLeave({
        leave_type: leaveType,
        reason,
        start_date: startDate,
        end_date: endDate,
        is_emergency: isEmergency,
        attachment_url: attachmentUrl,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Leave application submitted successfully! Waiting for admin approval.");
        setLeaveType("");
        setReason("");
        setStartDate("");
        setEndDate("");
        setIsEmergency(false);
        setAttachmentFile(null);
        fetchLeaves();
      }
    } catch (error) {
      toast.error("Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const downloadFacultyPdf = async (leave: any) => {
    try {
      // Resolve approver display name if reviewed_by present
      let approverName = leave.approved_by_name || "";
      if (!approverName && leave.reviewed_by) {
        const map = await supabaseService.getProfilesByIds([leave.reviewed_by]);
        approverName = map[leave.reviewed_by]?.full_name || "";
      }
      const approver = { name: approverName, id: "", role: "" };
      const applicant = {
        name: leave.faculty_name || (user as any)?.user_metadata?.full_name || '—',
        role: 'Faculty',
        id: null as string | null
      };

      // Offscreen render
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      container.style.top = '0';
      container.style.width = '210mm';
      document.body.appendChild(container);

      const wrapper = document.createElement('div');
      wrapper.id = 'faculty-pdf-wrapper';
      container.appendChild(wrapper);

      const root = createRoot(wrapper);
      const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      // Provide faculty_name fallback for template
      const leaveForTemplate = { ...leave, faculty_name: leave.faculty_name || (user as any)?.user_metadata?.full_name };
  root.render(<LeavePdfTemplate leave={leaveForTemplate as any} approver={approver} applicant={applicant} mode={mode as any} />);

  // Ensure QR and fonts render before capture
  await new Promise(res => setTimeout(res, 200));
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

      const name = leave.faculty_name || 'faculty';
      pdf.save(`faculty_leave_${name}_${leave.id}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } catch (e) {
      console.error('Faculty PDF generation failed', e);
    }
  };

  return (
    <Layout>
      <RoleBasedRoute allowedRoles={['faculty']}>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">My Leave Applications</h1>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Application Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Apply for Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveType} onValueChange={setLeaveType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                        <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                        <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave"
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="attachment"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted formats: PDF, JPG, PNG
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Leave History */}
            <Card>
              <CardHeader>
                <CardTitle>Application History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : leaves.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No leave applications yet
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {leaves.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{leave.leave_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(leave.status)}
                        </div>
                        <p className="text-sm">{leave.reason}</p>
                        {leave.admin_remarks && (
                          <div className="bg-muted p-2 rounded">
                            <p className="text-xs font-semibold">Admin Remarks:</p>
                            <p className="text-xs">{leave.admin_remarks}</p>
                          </div>
                        )}
                        {leave.status !== 'pending' && (
                          <p className="text-xs text-muted-foreground">
                            Approved By: {leave.approved_by_name || (leave.reviewed_by ? reviewers[leave.reviewed_by]?.full_name || '—' : '—')}
                          </p>
                        )}
                        {leave.status !== 'pending' && (
                          <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={() => downloadFacultyPdf(leave)}>
                              <Download className="h-4 w-4 mr-1" /> Download PDF
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleBasedRoute>
    </Layout>
  );
};

export default FacultyMyLeaves;
