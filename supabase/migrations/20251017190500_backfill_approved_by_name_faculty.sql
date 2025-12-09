-- Backfill approved_by_name for historical faculty leaves and add trigger for future safety

-- 1) Backfill: set approved_by_name where missing using profiles.full_name
update public.faculty_leave_applications f
set approved_by_name = p.full_name
from public.profiles p
where f.approved_by_name is null
  and f.reviewed_by = p.id
  and f.status in ('approved','rejected');

-- 2) Trigger: auto-populate approved_by_name on update when status/reviewer are set
create or replace function public.set_faculty_approved_by_name()
returns trigger
language plpgsql
as $$
begin
  if NEW.approved_by_name is null and NEW.reviewed_by is not null then
    select pr.full_name into NEW.approved_by_name from public.profiles pr where pr.id = NEW.reviewed_by;
  end if;
  return NEW;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_set_faculty_approved_by_name'
  ) then
    create trigger trg_set_faculty_approved_by_name
    before update on public.faculty_leave_applications
    for each row
    execute function public.set_faculty_approved_by_name();
  end if;
end $$;

comment on function public.set_faculty_approved_by_name() is 'Ensures approved_by_name is populated from profiles on faculty leave updates.';