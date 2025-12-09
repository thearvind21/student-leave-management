-- DEV ENV: Broaden policies so AdminContext can view/update student leaves
-- Note: tighten for production by requiring authenticated role and role checks

-- Ensure RLS is enabled
alter table if exists public.leave_applications enable row level security;

-- Allow select for anon and authenticated (current environment)
drop policy if exists "leave_select_all_anon" on public.leave_applications;
create policy "leave_select_all_anon" on public.leave_applications for select to anon using (true);

drop policy if exists "leave_select_all_auth" on public.leave_applications;
create policy "leave_select_all_auth" on public.leave_applications for select to authenticated using (true);

-- Allow updates for admin/faculty flows in current environment
drop policy if exists "leave_update_all_anon" on public.leave_applications;
create policy "leave_update_all_anon" on public.leave_applications for update to anon using (true) with check (true);

drop policy if exists "leave_update_all_auth" on public.leave_applications;
create policy "leave_update_all_auth" on public.leave_applications for update to authenticated using (true) with check (true);
