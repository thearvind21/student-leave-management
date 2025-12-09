
import { Calendar } from "lucide-react";

interface EmptyLeaveStateProps {
  hasFilters: boolean;
}

const EmptyLeaveState = ({ hasFilters }: EmptyLeaveStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">No leaves found</h3>
      <p className="text-muted-foreground mt-1">
        {hasFilters
          ? "Please change your filters or clear your search"
          : "You haven't applied for any leave yet"}
      </p>
    </div>
  );
};

export default EmptyLeaveState;
