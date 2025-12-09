-- Enable RLS on user_roles (ensure it is on)
alter table public.user_roles enable row level security;

-- Allow authenticated users to view roles (needed for UI to check if user is admin)
drop policy if exists "user_roles_select_authenticated" on public.user_roles;
create policy "user_roles_select_authenticated" on public.user_roles
  for select to authenticated
  using (true);

-- Allow admins to insert/update/delete user_roles
-- We use a recursive check or a direct check. 
-- Since we need to check if the *current* user is an admin to allow them to modify roles,
-- we can use the `get_user_role` function or a direct query.
-- However, `get_user_role` might cause infinite recursion if it queries `user_roles` and we are inside a policy for `user_roles`.
-- To avoid recursion, we can use `auth.uid()` and check against a separate admin list or use a JWT claim if available.
-- But here, we are using `user_roles` table itself to store roles.
-- A common pattern to avoid infinite recursion in RLS when the policy depends on the table itself is to use `security definer` functions or ensure the lookup doesn't trigger the same policy.
-- But `get_user_role` is `language sql` and queries `user_roles`.
-- Let's check `get_user_role` definition again. It is `stable` and queries `user_roles`.
-- If we use it in a policy for `user_roles`, it will trigger the SELECT policy.
-- The SELECT policy `user_roles_select_authenticated` allows `true`, so it won't block.
-- So it should be safe to use `get_user_role(auth.uid()) = 'admin'` in the USING/WITH CHECK clauses for modification policies.

drop policy if exists "user_roles_insert_admin" on public.user_roles;
create policy "user_roles_insert_admin" on public.user_roles
  for insert to authenticated
  with check (
    public.get_user_role(auth.uid()) = 'admin'
  );

drop policy if exists "user_roles_update_admin" on public.user_roles;
create policy "user_roles_update_admin" on public.user_roles
  for update to authenticated
  using (
    public.get_user_role(auth.uid()) = 'admin'
  )
  with check (
    public.get_user_role(auth.uid()) = 'admin'
  );

drop policy if exists "user_roles_delete_admin" on public.user_roles;
create policy "user_roles_delete_admin" on public.user_roles
  for delete to authenticated
  using (
    public.get_user_role(auth.uid()) = 'admin'
  );
