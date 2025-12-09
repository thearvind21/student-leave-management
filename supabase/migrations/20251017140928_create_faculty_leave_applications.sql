-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- Create table for faculty leave applications
create table if not exists public.faculty_leave_applications (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null,
  reason text not null,
  start_date date not null,
  end_date date not null,
  is_emergency boolean not null default false,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_remarks text,
  reviewed_by uuid references public.profiles(id),
  applied_on timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_faculty_leaves_faculty on public.faculty_leave_applications(faculty_id);
create index if not exists idx_faculty_leaves_status on public.faculty_leave_applications(status);
create index if not exists idx_faculty_leaves_applied_on on public.faculty_leave_applications(applied_on desc);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_faculty_leaves_updated_at on public.faculty_leave_applications;
create trigger trg_faculty_leaves_updated_at
before update on public.faculty_leave_applications
for each row execute procedure public.set_updated_at();

-- RLS policies
alter table public.faculty_leave_applications enable row level security;

-- Allow authenticated users to read all faculty leave applications (adjust if needed)
drop policy if exists "faculty_leaves_select_all_auth" on public.faculty_leave_applications;
create policy "faculty_leaves_select_all_auth"
  on public.faculty_leave_applications
  for select
  to authenticated
  using (true);

-- Allow anon (unauthenticated) reads for admin UI that doesn't use Supabase auth
-- NOTE: Consider tightening this in production.
drop policy if exists "faculty_leaves_select_anon" on public.faculty_leave_applications;
create policy "faculty_leaves_select_anon"
  on public.faculty_leave_applications
  for select
  to anon
  using (true);

-- Faculty can insert their own leave applications
drop policy if exists "faculty_leaves_insert_own" on public.faculty_leave_applications;
create policy "faculty_leaves_insert_own"
  on public.faculty_leave_applications
  for insert
  to authenticated
  with check (
    faculty_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'faculty'
    )
  );

-- Admin or faculty can update (approve/reject) any faculty leave
drop policy if exists "faculty_leaves_update_admin_or_faculty" on public.faculty_leave_applications;
create policy "faculty_leaves_update_admin_or_faculty"
  on public.faculty_leave_applications
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','faculty')
    )
  );

-- Optionally, faculty can see only their own via tighter select policy. We currently allow all authenticated to select.
