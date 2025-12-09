import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/services/supabaseService";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client"; // FIX: import supabase

type LeaveApplicationFormProps = {
  onSuccess?: () => void;
};

const LeaveApplicationForm = ({ onSuccess }: LeaveApplicationFormProps) => {
  const { user } = useAuth();

  const [quota, setQuota] = useState<number>(0);
  const [usedQuota, setUsedQuota] = useState<number>(0); // FIX: track usedQuota

  // Fetch the user's current quota and usedQuota
  useEffect(() => {
    const fetchQuotaAndUsed = async () => {
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("leave_quota")
          .eq("id", user.id)
          .single();
        setQuota(profile?.leave_quota ?? 10);

        // Fetch used quota (approved leaves) - bypass TypeScript issues
        try {
          const supabaseClient: any = supabase;
          const quotaResponse = await supabaseClient
            .from('leave_applications')
            .select('id', { count: "exact", head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved');
          setUsedQuota(quotaResponse.count ?? 0);
        } catch (error) {
          console.error("Error fetching used quota:", error);
          setUsedQuota(0);
        }
      }
    };
    fetchQuotaAndUsed();
  }, [user]);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    
    if (!startDate || !endDate || !leaveType || !reason) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (startDate > endDate) {
      setError("The return date cannot be earlier than the leave start date");
      return;
    }
    
    if (!user) {
      setError("You must be logged in to apply for leave");
      return;
    }
    
    // Before submitting, check for user's used quota - bypass TypeScript issues
    let usedQuota = 0;
    try {
      const supabaseClient: any = supabase;
      const quotaResponse = await supabaseClient
        .from('leave_applications')
        .select('*', { count: "exact", head: true })
        .eq('user_id', user.id)
        .eq('status', 'approved');
      usedQuota = quotaResponse.count || 0;
    } catch (error) {
      console.error("Error checking quota:", error);
      usedQuota = 0;
    }

    if (usedQuota >= quota) {
      toast.error("Leave quota exceeded, request cannot be submitted.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      let attachmentUrl = undefined;
      if (attachmentFile) {
        const { url, error: uploadError } = await supabaseService.uploadAttachment(attachmentFile, user.id);
        if (uploadError) {
          throw new Error(`File upload error: ${uploadError}`);
        }
        attachmentUrl = url || undefined;
      }
      
      const { data, error } = await supabaseService.submitLeave({
        leave_type: leaveType,
        reason,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_emergency: isEmergency,
        attachment_url: attachmentUrl
      });
      
      if (error) {
        throw new Error(error);
      }
      
      toast.success("Your leave application has been successfully submitted!");
      
      // Either close modal via callback or navigate to My Leaves
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/my-leaves');
      }
    } catch (err) {
      console.error("Error submitting leave application:", err);
      setError(err instanceof Error ? err.message : "Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }
      setAttachmentFile(file);
    }
  };

  const leaveTypes = [
    "Medical Leave",
    "Family Emergency",
    "Educational Program",
    "Personal Reasons",
    "Other"
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Card className="w-full shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-800">Leave Application</CardTitle>
            <CardDescription>Fill out the form to apply for a leave</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-gray-700">Leave Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 hover:border-blue-500 transition-colors",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-gray-700">Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-300 hover:border-blue-500 transition-colors",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => 
                        startDate ? date < startDate : date < new Date()
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leave-type" className="text-gray-700">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="border-gray-300 hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-700">Reason for Leave</Label>
              <Textarea
                id="reason"
                placeholder="Please provide details about your leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px] border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="emergency" 
                checked={isEmergency}
                onCheckedChange={(checked) => setIsEmergency(checked === true)}
              />
              <label
                htmlFor="emergency"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This is an emergency leave
              </label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attachment" className="text-gray-700">Supporting Documents (Optional)</Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="attachment"
                  className="cursor-pointer border rounded py-2 px-4 inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Choose File</span>
                </Label>
                <Input
                  id="attachment"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-500">
                  {attachmentFile ? attachmentFile.name : "No file selected"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Accepted file types: PDF, JPG, JPEG, PNG, DOC, DOCX. Maximum file size: 5MB.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 rounded-b-lg">
            <Button 
              onClick={handleSubmit} 
              className="w-full sm:w-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Submit Application</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        Your remaining quota:{" "}
        <span className="font-semibold">
          {quota - usedQuota}
        </span>
      </div>
    </form>
  );
};

export default LeaveApplicationForm;
