
import { Badge } from "@/components/ui/badge";

interface LeaveStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

const LeaveStatusBadge = ({ status }: LeaveStatusBadgeProps) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500">Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'pending':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default LeaveStatusBadge;
