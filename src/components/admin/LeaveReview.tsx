import { useState, useEffect } from "react";
import React, { useRef } from "react";
import LeavePdfTemplate from "./LeavePdfTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, FileText, Download, ThumbsUp, ThumbsDown, AlertTriangle, Loader2 } from "lucide-react";
import { LeaveApplication, supabaseService } from "@/services/supabaseService";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";
import { roleHelpers } from "@/services/supabaseService";

interface LeaveReviewProps {
  leave: LeaveApplication;
  onStatusUpdate: () => void;
}

const LeaveReview = ({ leave, onStatusUpdate }: LeaveReviewProps) => {
  const { user, profile } = useAuth();
  const { isAdminAuthenticated } = useAdmin();

  const [approverName, setApproverName] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [teacherRemarks, setTeacherRemarks] = useState("");
  const [isReasonInvalid, setIsReasonInvalid] = useState(false);
  const [comments, setComments] = useState("");
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (leave.reviewed_by) {
        try {
          const map = await supabaseService.getProfilesByIds([leave.reviewed_by]);
          if (!ignore) setApproverName(map[leave.reviewed_by]?.full_name || "");
        } catch (_) { }
      }
    };
    run();
    return () => { ignore = true; };
  }, [leave.reviewed_by]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    // Allow if user is logged in OR if admin is authenticated via context

    if (!user && !isAdminAuthenticated) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    try {
      if (status === 'approved') {
        setIsApproving(true);
      } else {
        setIsRejecting(true);
      }

      // FIX: Check role via profile, not user
      let result: any = { success: true };
      if (profile && (roleHelpers.isFaculty(profile) || roleHelpers.isAdmin(profile))) {
        result = await supabaseService.updateRemarksAndReasonFlag(
          leave.id,
          teacherRemarks,
          nlpDetectInvalidReason(leave.reason),
          user?.id || 'admin' // Fallback for admin context
        );
      }

      if (!result.success) throw new Error(result.error);

      const { success, error } = await supabaseService.updateLeaveStatus(
        leave.id,
        status,
        user?.id || null,
        comments
      );

      if (error) {
        throw new Error(error);
      }

      toast.success(`Leave application has been ${status}`);
      onStatusUpdate();
    } catch (error) {
      console.error(`Error ${status} leave:`, error);
      toast.error(`Failed to ${status} leave application`);
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  // Add a simple repetitive/invalid reason checker for NLP demo
  const nlpDetectInvalidReason = (reason: string) => {
    const lower = (reason || "").toLowerCase();
    // Very basic: flag if "not feeling well" or "out of station" repeats
    return ["not feeling well", "out of station"].some(phrase => lower.includes(phrase));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // PDF: ref for the printable template
  const pdfRef = useRef<HTMLDivElement>(null);

  // Role/Audit: Figure out approver display based on user and leave
  const getApproverDisplay = () => {
    // Prefer resolved approver full name; fallback to first line of remarks, else empty
    const name = approverName || (leave.teacher_remarks ? (leave.teacher_remarks.split("\n")[0] || "") : "");
    return { name, id: "", role: "" };
  };

  // PDF generation logic
  const handleDownloadPdf = async () => {
    if (pdfRef.current) {
      // Use html2canvas snapshot for PDF
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor:
          document.documentElement.classList.contains("dark") ? "#18181b" : "#fff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = 210;
      const pageHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);

      // Calculate image size
      let pdfWidth = pageWidth;
      let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      if (pdfHeight > pageHeight) {
        pdfHeight = pageHeight;
        pdfWidth = (imgProps.width * pdfHeight) / imgProps.height;
      }

      pdf.addImage(
        imgData,
        "PNG",
        (pageWidth - pdfWidth) / 2,
        10,
        pdfWidth,
        pdfHeight
      );
      pdf.save(
        `Leave_${leave.student?.student_id ?? leave.student_id}_${leave.id
        }_${leave.status}.pdf`
      );
    }
  };

  const isPending = leave.status === "pending";
  const studentName = leave.student ? leave.student.full_name : "Student";

  return (
    <Card className="w-full shadow mb-6 overflow-hidden border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{leave.leave_type}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center space-x-1">
                <span className="font-medium">{studentName}</span>
                {leave.student && <span>({leave.student.student_id})</span>}
              </div>
            </CardDescription>
          </div>
          <Badge className={`
            ${leave.status === 'approved' ? 'bg-green-500' :
              leave.status === 'rejected' ? 'bg-red-500' :
                'bg-amber-500'}
          `}>
            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>From: <span className="font-semibold">{formatDate(leave.start_date)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>To: <span className="font-semibold">{formatDate(leave.end_date)}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <Clock className="h-4 w-4" />
          <span>Applied on: <span className="font-semibold">{formatDate(leave.applied_on)}</span></span>
        </div>

        {leave.is_emergency && (
          <div className="bg-red-50 p-3 rounded-md flex items-center gap-2 mb-4 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Emergency Leave</span>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium mb-2">Reason for Leave</h4>
          <p className="text-gray-600">{leave.reason}</p>
        </div>

        {leave.attachment_url && (
          <div className="mb-4">
            <a
              href={leave.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4" />
              <span>View Attachment</span>
              <Download className="h-4 w-4" />
            </a>
          </div>
        )}

        {profile && (roleHelpers.isFaculty(profile) || roleHelpers.isAdmin(profile)) && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Teacher Remarks
            </label>
            <Textarea
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
              placeholder="Add remarks for the student/leave reason..."
              className="min-h-[80px]"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={isReasonInvalid}
                onChange={() => setIsReasonInvalid(v => !v)}
                className="mr-2"
              />
              <span className="text-xs text-amber-700">
                Mark reason as repetitive/invalid (NLP Demo)
              </span>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Comments (optional)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments or feedback for the student..."
              className="min-h-[100px]"
            />
          </div>
        )}

        {!isPending && leave.comments && (
          <div className="bg-gray-50 p-4 rounded-md mb-2">
            <h4 className="font-medium mb-2">Admin Comments</h4>
            <p className="text-gray-600">{leave.comments}</p>
          </div>
        )}
      </CardContent>

      <div style={{ display: "none" }}>
        {!isPending && (
          <div ref={pdfRef}>
            <LeavePdfTemplate
              leave={leave}
              approver={getApproverDisplay()}
              mode={document.documentElement.classList.contains("dark") ? "dark" : "light"}
            />
          </div>
        )}
      </div>

      {/* PDF Download Button */}
      {!isPending && leave.status === "approved" && (
        <div className="w-full px-6 pb-5 flex justify-end">
          <Button
            className="bg-primary text-white shadow-md"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </div>
      )}

      {/* Admin Override: Show actions if pending OR if admin wants to change decision */}
      {(isPending || isAdminAuthenticated || (profile && roleHelpers.isAdmin(profile))) && (
        <CardFooter className="bg-gray-50 border-t">
          <div className="flex gap-3 w-full">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex-1 flex items-center gap-1.5"
                  disabled={isRejecting || isApproving}
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-4 w-4" />
                  )}
                  <span>Reject</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Leave Application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will notify the student that their leave application has been rejected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => handleStatusUpdate('rejected')}
                  >
                    Yes, Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" />
                  )}
                  <span>Approve</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Leave Application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will notify the student that their leave application has been approved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleStatusUpdate('approved')}
                  >
                    Yes, Approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      )
      }
    </Card >
  );
};

export default LeaveReview;
