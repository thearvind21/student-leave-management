import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import LeaveFilters from "@/components/leave/LeaveFilters";
import LeavesTable from "@/components/leave/LeavesTable";
import EmptyLeaveState from "@/components/leave/EmptyLeaveState";
import LeaveReview from "./LeaveReview";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { LeaveApplication, supabaseService } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";
// Note: Faculty leaves are managed in FacultyLeaveManagement; this view handles student leaves only.

const LeaveManagement = () => {
  const { isAdminAuthenticated } = useAdmin();
  const { isAdmin } = useAuth();
  const {
    leaves,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    formatDate,
    hasFilters,
    refreshLeaves
  } = useLeaveHistory();

  // Real-time subscription for student leave updates
  useEffect(() => {
    const channel = supabase
      .channel('leave-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_applications'
        },
        () => {
          refreshLeaves();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshLeaves]);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedTab, setSelectedTab] = useState("all");
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentOptions, setStudentOptions] = useState<Array<{ id: string; full_name: string; email: string; }>>([]);

  // Filter leaves based on selected tab
  const filteredLeaves = leaves.filter(leave => {
    if (selectedTab === "pending") return leave.status === "pending";
    if (selectedTab === "approved") return leave.status === "approved";
    if (selectedTab === "rejected") return leave.status === "rejected";
    return true; // "all" tab
  });

  // Get counts for each status
  const pendingCount = leaves.filter(leave => leave.status === "pending").length;
  const approvedCount = leaves.filter(leave => leave.status === "approved").length;
  const rejectedCount = leaves.filter(leave => leave.status === "rejected").length;

  const handleLeaveUpdated = () => {
    refreshLeaves();
  };

  // Quick student search for admin apply dialog
  useEffect(() => {
    const run = async () => {
      if (applyOpen && studentSearch.length >= 2) {
        const supabaseClient: any = supabase;
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id, full_name, email, role')
          .ilike('full_name', `%${studentSearch}%`)
          .limit(10);
        if (!error) {
          setStudentOptions((data || []).filter((p: any) => p.role === 'student'));
        }
      }
    };
    run();
  }, [applyOpen, studentSearch]);

  const submitOnBehalf = async () => {
    try {
      if (!selectedStudentId || !leaveType || !reason || !startDate || !endDate) {
        toast.error('Please fill all fields');
        return;
      }
      if (startDate > endDate) {
        toast.error('Return date cannot be earlier than start date');
        return;
      }
      setIsSubmitting(true);
      // Reuse submit via supabase direct insert since supabaseService.submitLeave uses current user
      const supabaseClient: any = supabase;
      const { data: profile, error: pErr } = await supabaseClient
        .from('profiles')
        .select('full_name, student_id')
        .eq('id', selectedStudentId)
        .single();
      if (pErr || !profile) throw pErr || new Error('Student not found');
      const { error } = await supabaseClient
        .from('leave_applications')
        .insert({
          user_id: selectedStudentId,
          student_id: profile.student_id || selectedStudentId,
          leave_type: leaveType,
          reason,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_emergency: false,
          student_name: profile.full_name,
          status: 'pending'
        });
      if (error) throw error;
      toast.success('Leave submitted on behalf of student');
      setApplyOpen(false);
      setSelectedStudentId("");
      setLeaveType("");
      setReason("");
      setStartDate(undefined);
      setEndDate(undefined);
      refreshLeaves();
    } catch (e: any) {
      console.error('Submit on behalf failed:', e);
      toast.error(e?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-muted-foreground">Loading leave applications...</p>
        </div>
      </div>
    );
  }

  const handleBackfill = async () => {
    try {
      const { updated, failed, error } = await supabaseService.backfillApprovedByNames();
      if (error) {
        toast.error(`Backfill failed: ${error}`);
        return;
      }
      toast.success(`Backfill complete: ${updated} updated, ${failed} skipped`);
      refreshLeaves();
    } catch (e: any) {
      toast.error(e?.message || 'Backfill failed');
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-gray-800">Leave Management</CardTitle>
          <CardDescription>Review and process student leave applications</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            {(isAdminAuthenticated || isAdmin()) && (
              <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                <div className="text-sm text-muted-foreground">Admin tools</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackfill}>Backfill approver names</Button>
                  <Button variant="secondary" onClick={() => setApplyOpen(true)}>Apply on behalf of student</Button>
                </div>
              </div>
            )}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  All
                  <span className="ml-2 bg-gray-200 text-gray-800 text-xs rounded-full px-2 py-0.5">
                    {leaves.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <span className="ml-2 bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">
                    {approvedCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                  <span className="ml-2 bg-red-100 text-red-800 text-xs rounded-full px-2 py-0.5">
                    {rejectedCount}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <LeaveFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
                {renderLeaveContent(filteredLeaves)}
              </TabsContent>

              <TabsContent value="pending">
                <LeaveFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter="pending"
                  setStatusFilter={setStatusFilter}
                />
                {renderLeaveContent(filteredLeaves)}
              </TabsContent>

              <TabsContent value="approved">
                <LeaveFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter="approved"
                  setStatusFilter={setStatusFilter}
                />
                {renderLeaveContent(filteredLeaves)}
              </TabsContent>

              <TabsContent value="rejected">
                <LeaveFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter="rejected"
                  setStatusFilter={setStatusFilter}
                />
                {renderLeaveContent(filteredLeaves)}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Apply on behalf dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Leave on Behalf of Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Find student</Label>
              <Input placeholder="Search by name" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              <div className="mt-2 max-h-40 overflow-auto border rounded">
                {studentOptions.map(opt => (
                  <button key={opt.id} type="button" onClick={() => setSelectedStudentId(opt.id)} className={`w-full text-left px-3 py-2 hover:bg-muted ${selectedStudentId === opt.id ? 'bg-muted' : ''}`}>
                    <div className="font-medium">{opt.full_name}</div>
                    <div className="text-xs text-muted-foreground">{opt.email}</div>
                  </button>
                ))}
                {studentOptions.length === 0 && <div className="p-3 text-sm text-muted-foreground">Type at least 2 letters…</div>}
              </div>
              {selectedStudentId && <div className="mt-1 text-xs">Selected ID: <span className="font-mono">{selectedStudentId.slice(0, 8)}…</span></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? startDate.toDateString() : 'Select date'}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? endDate.toDateString() : 'Select date'}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>Leave type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {['Medical Leave', 'Family Emergency', 'Educational Program', 'Personal Reasons', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={submitOnBehalf} disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  function renderLeaveContent(leaves: LeaveApplication[]) {
    if (leaves.length === 0) {
      return <EmptyLeaveState hasFilters={hasFilters} />;
    }

    if (viewMode === 'table') {
      return <LeavesTable leaves={leaves} formatDate={formatDate} onUpdated={handleLeaveUpdated} />;
    } else {
      return (
        <div className="space-y-6">
          {leaves.map(leave => (
            <LeaveReview
              key={leave.id}
              leave={leave}
              onStatusUpdate={handleLeaveUpdated}
            />
          ))}
        </div>
      );
    }
  }
};

export default LeaveManagement;
