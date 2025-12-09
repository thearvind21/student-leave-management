
import Layout from "@/components/layout/Layout";
import LeaveCalendar from "@/components/calendar/LeaveCalendar";

const CalendarPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View leave applications and holidays on the calendar
          </p>
        </div>
        <LeaveCalendar />
      </div>
    </Layout>
  );
};

export default CalendarPage;
