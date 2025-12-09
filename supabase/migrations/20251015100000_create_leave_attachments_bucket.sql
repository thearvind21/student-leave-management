-- Create a public storage bucket for leave attachments (id = 'leave_attachments')
-- Safe to run multiple times due to ON CONFLICT

insert into storage.buckets (id, name, public)
values ('leave_attachments', 'leave_attachments', true)
on conflict (id) do nothing;

-- Policies for bucket 'leave_attachments'
-- 1) Public can read (so getPublicUrl works)
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
      and tablename = 'objects' 
      and policyname = 'Public read for leave_attachments'
  ) then
    create policy "Public read for leave_attachments"
      on storage.objects for select
      using (bucket_id = 'leave_attachments');
  end if;
end $$;

-- 2) Authenticated users can upload into their own folder (prefix = auth.uid())
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
      and tablename = 'objects' 
      and policyname = 'Authenticated upload to leave_attachments'
  ) then
    create policy "Authenticated upload to leave_attachments"
      on storage.objects for insert
      with check (
        bucket_id = 'leave_attachments'
        and auth.role() = 'authenticated'
        and (name like auth.uid()::text || '/%')
      );
  end if;
end $$;

-- 3) Authenticated users can update objects under their own prefix
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
      and tablename = 'objects' 
      and policyname = 'Authenticated update own leave_attachments'
  ) then
    create policy "Authenticated update own leave_attachments"
      on storage.objects for update
      using (
        bucket_id = 'leave_attachments'
        and auth.role() = 'authenticated'
        and (name like auth.uid()::text || '/%')
      );
  end if;
end $$;

-- 4) Authenticated users can delete objects under their own prefix
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' 
      and tablename = 'objects' 
      and policyname = 'Authenticated delete own leave_attachments'
  ) then
    create policy "Authenticated delete own leave_attachments"
      on storage.objects for delete
      using (
        bucket_id = 'leave_attachments'
        and auth.role() = 'authenticated'
        and (name like auth.uid()::text || '/%')
      );
  end if;
end $$;
