-- Create user_roles table if not exists
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student','faculty','admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

-- Policies: permit anon for current environment (tighten later)
drop policy if exists "user_roles_select_anon" on public.user_roles;
create policy "user_roles_select_anon" on public.user_roles for select to anon using (true);

drop policy if exists "user_roles_modify_anon" on public.user_roles;
create policy "user_roles_modify_anon" on public.user_roles for all to anon using (true) with check (true);

-- Profiles select policy for anon
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_anon" on public.profiles;
create policy "profiles_select_anon" on public.profiles for select to anon using (true);

-- Allow anon to update and delete profiles in current environment (tighten later)
drop policy if exists "profiles_modify_anon" on public.profiles;
create policy "profiles_modify_anon" on public.profiles for all to anon using (true) with check (true);

-- RPC to get a user's primary role (admin > faculty > student)
drop function if exists public.get_user_role(uuid);
create or replace function public.get_user_role(_user_id uuid)
returns text
language sql stable as $$
  with roles as (
    -- Cast role to text to avoid enum literal coercion issues
    select role::text as role_text from public.user_roles where user_id = _user_id
  )
  select coalesce(
    (select 'admin'::text from roles where role_text = 'admin' limit 1),
    (select 'faculty'::text from roles where role_text = 'faculty' limit 1),
    (select 'student'::text from roles where role_text = 'student' limit 1)
  );
$$;

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql stable as $$
  select exists(
    select 1 from public.user_roles where user_id = _user_id and role::text = _role
  );
$$;
