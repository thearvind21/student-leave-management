-- Idempotent backfill of audit_logs from existing student and faculty leaves
-- 1) Student leave submissions -> submit_leave
insert into public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
select l.user_id, 'submit_leave', 'leave_application', l.id::text,
       jsonb_build_object('leave_type', l.leave_type),
       coalesce(l.applied_on, now())
from public.leave_applications l
where not exists (
  select 1 from public.audit_logs a
  where a.entity_type = 'leave_application' and a.entity_id = l.id::text and a.action = 'submit_leave'
);

-- 2) Student approvals/rejections -> approved_leave / rejected_leave
insert into public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
select coalesce(l.reviewed_by, l.user_id) as user_id,
  (case when l.status = 'approved' then 'approved_leave' when l.status = 'rejected' then 'rejected_leave' end),
       'leave_application', l.id::text,
  (
    case when l.reviewed_by is null then jsonb_build_object('backfill_note','no_reviewer_found')
    when l.comments is not null then jsonb_build_object('comments', l.comments)
    else null end
  ),
       coalesce(l.updated_at, l.applied_on, now())
from public.leave_applications l
where l.status in ('approved','rejected')
  and not exists (
    select 1 from public.audit_logs a
    where a.entity_type = 'leave_application' and a.entity_id = l.id::text and a.action in ('approved_leave','rejected_leave')
  );

-- 3) Faculty leave submissions -> submit_faculty_leave
insert into public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
select l.faculty_id, 'submit_faculty_leave', 'faculty_leave_application', l.id::text,
       jsonb_build_object('leave_type', l.leave_type),
       coalesce(l.applied_on, now())
from public.faculty_leave_applications l
where not exists (
  select 1 from public.audit_logs a
  where a.entity_type = 'faculty_leave_application' and a.entity_id = l.id::text and a.action = 'submit_faculty_leave'
);

-- 4) Faculty approvals/rejections -> approved_faculty_leave / rejected_faculty_leave
insert into public.audit_logs (user_id, action, entity_type, entity_id, details, created_at)
select coalesce(l.reviewed_by, l.faculty_id) as user_id,
  (case when l.status = 'approved' then 'approved_faculty_leave' when l.status = 'rejected' then 'rejected_faculty_leave' end),
       'faculty_leave_application', l.id::text,
  (
    case when l.reviewed_by is null then jsonb_build_object('backfill_note','no_reviewer_found')
    when l.admin_remarks is not null then jsonb_build_object('remarks', l.admin_remarks)
    else null end
  ),
       coalesce(l.updated_at, l.applied_on, now())
from public.faculty_leave_applications l
where l.status in ('approved','rejected')
  and not exists (
    select 1 from public.audit_logs a
    where a.entity_type = 'faculty_leave_application' and a.entity_id = l.id::text and a.action in ('approved_faculty_leave','rejected_faculty_leave')
  );

-- 5) Helpful index (no-op if exists) already created in earlier migration.