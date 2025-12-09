-- Add denormalized faculty display fields
alter table public.faculty_leave_applications
  add column if not exists faculty_name text,
  add column if not exists faculty_email text;

-- Optional: allow anon to update in this environment so admin UI (without Supabase auth) can approve/reject
-- Tighten this in production by removing anon and ensuring admin uses Supabase Auth session with role=admin in profiles
drop policy if exists "faculty_leaves_update_anon" on public.faculty_leave_applications;
create policy "faculty_leaves_update_anon"
  on public.faculty_leave_applications
  for update
  to anon
  using (true);
