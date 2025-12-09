-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- Create audit_logs table for tracking actions
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  details jsonb null,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Allow reads for anon (current environment). Tighten later to authenticated only.
drop policy if exists "audit_logs_select_anon" on public.audit_logs;
create policy "audit_logs_select_anon" on public.audit_logs for select to anon using (true);

-- Also allow reads for authenticated users
drop policy if exists "audit_logs_select_auth" on public.audit_logs;
create policy "audit_logs_select_auth" on public.audit_logs for select to authenticated using (true);

-- Allow inserts for anon/auth (so client-side inserts from admin/faculty succeed). Tighten later.
drop policy if exists "audit_logs_insert_anon" on public.audit_logs;
create policy "audit_logs_insert_anon" on public.audit_logs for insert to anon with check (true);
drop policy if exists "audit_logs_insert_auth" on public.audit_logs;
create policy "audit_logs_insert_auth" on public.audit_logs for insert to authenticated with check (true);

-- Helpful index for ordering/filtering
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- Optional explicit grants (Supabase usually sets these by default)
grant usage on schema public to anon, authenticated;
grant select, insert on public.audit_logs to anon, authenticated;
