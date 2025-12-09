
import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeaveHistory } from "@/hooks/useLeaveHistory";
import LeaveFilters from "./LeaveFilters";
import LeavesTable from "./LeavesTable";
import EmptyLeaveState from "./EmptyLeaveState";
import { useAuth } from "@/context/AuthContext";

const LeaveHistory = () => {
  const {
    leaves,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    formatDate,
    hasFilters
  } = useLeaveHistory();

  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading leave history...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isStudent ? "My Leave History" : "Leave Applications"}
        </CardTitle>
        <CardDescription>
          {isStudent 
            ? "View the status of all your leave requests" 
            : "View and manage all leave applications"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaveFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {leaves.length > 0 ? (
          <LeavesTable leaves={leaves} formatDate={formatDate} />
        ) : (
          <EmptyLeaveState hasFilters={hasFilters} />
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveHistory;
