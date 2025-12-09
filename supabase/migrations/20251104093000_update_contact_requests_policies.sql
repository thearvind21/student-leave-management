-- Relax select policies so Admin UI works without Supabase session for admins
-- Safe to run multiple times

-- Ensure table exists
create table if not exists public.contact_requests (
  id uuid primary key,
  name text,
  email text,
  institution text,
  message text,
  status text,
  handled_by uuid,
  created_at timestamptz
);

alter table public.contact_requests enable row level security;

-- Allow anon and authenticated users to SELECT (read-only)
drop policy if exists "contact_requests_select_anon" on public.contact_requests;
create policy "contact_requests_select_anon"
  on public.contact_requests for select to anon
  using (true);

drop policy if exists "contact_requests_select_auth" on public.contact_requests;
create policy "contact_requests_select_auth"
  on public.contact_requests for select to authenticated
  using (true);

-- Keep existing insert/update policies as defined previously
