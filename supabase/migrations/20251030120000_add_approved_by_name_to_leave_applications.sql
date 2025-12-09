-- Add approver display name to student leave applications for PDF/reporting
ALTER TABLE IF EXISTS public.leave_applications
ADD COLUMN IF NOT EXISTS approved_by_name text;

COMMENT ON COLUMN public.leave_applications.approved_by_name IS 'Resolved display name of the approver at the time of decision (denormalized)';
