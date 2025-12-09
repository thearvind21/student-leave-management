-- Fix RLS policies to use user_id consistently and add notification trigger

-- Drop existing student policies that use student_id incorrectly
DROP POLICY IF EXISTS "Students can view their own leave applications" ON leave_applications;
DROP POLICY IF EXISTS "Students can insert their own leave applications" ON leave_applications;
DROP POLICY IF EXISTS "Students can update their own pending leave applications" ON leave_applications;

-- Create correct policies using user_id
CREATE POLICY "Students can view their own leave applications"
ON leave_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own leave applications"
ON leave_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own pending leave applications"
ON leave_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Enable realtime for leave_applications
ALTER TABLE leave_applications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'leave_applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_applications;
  END IF;
END $$;

-- Create trigger function to send notifications on leave status change
CREATE OR REPLACE FUNCTION notify_leave_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status changed from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    INSERT INTO notifications (user_id, title, message, related_to)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Leave Request Approved'
        WHEN NEW.status = 'rejected' THEN 'Leave Request Rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your leave request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been approved.'
        WHEN NEW.status = 'rejected' THEN 'Your leave request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been rejected.' || 
          CASE WHEN NEW.teacher_remarks IS NOT NULL THEN ' Reason: ' || NEW.teacher_remarks ELSE '' END
      END,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for leave status changes
DROP TRIGGER IF EXISTS on_leave_status_change ON leave_applications;
CREATE TRIGGER on_leave_status_change
  AFTER UPDATE ON leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_leave_status_change();

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;