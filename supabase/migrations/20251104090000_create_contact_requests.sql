-- Ensure pgcrypto for UUIDs
create extension if not exists pgcrypto;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  institution text not null,
  message text,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  handled_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_requests_created_at on public.contact_requests(created_at desc);

-- RLS
alter table public.contact_requests enable row level security;

-- Allow anon inserts (public form)
drop policy if exists "contact_requests_insert_anon" on public.contact_requests;
create policy "contact_requests_insert_anon"
  on public.contact_requests for insert to anon
  with check (true);

-- Allow authenticated admins to select
-- requires has_role() function present in this DB
 drop policy if exists "contact_requests_select_admin" on public.contact_requests;
 create policy "contact_requests_select_admin"
   on public.contact_requests for select to authenticated
   using (has_role(auth.uid(), 'admin'));

-- Allow authenticated admins to update status/handled_by
 drop policy if exists "contact_requests_update_admin" on public.contact_requests;
 create policy "contact_requests_update_admin"
   on public.contact_requests for update to authenticated
   using (has_role(auth.uid(), 'admin'));
