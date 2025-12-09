-- Backfill denormalized faculty display fields for existing rows
update public.faculty_leave_applications f
set 
  faculty_name = coalesce(f.faculty_name, p.full_name),
  faculty_email = coalesce(f.faculty_email, p.email)
from public.profiles p
where p.id = f.faculty_id
  and (f.faculty_name is null or f.faculty_email is null);
