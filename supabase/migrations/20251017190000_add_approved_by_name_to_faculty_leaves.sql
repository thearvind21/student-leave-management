-- Add approved_by_name column to store the approver's display name for faculty leaves
alter table if exists public.faculty_leave_applications
  add column if not exists approved_by_name text;

comment on column public.faculty_leave_applications.approved_by_name is 'Denormalized approver display name for privacy-friendly PDFs and UI.';