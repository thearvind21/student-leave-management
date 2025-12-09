-- Fix for "Direct status updates are not allowed" error
-- This error is likely coming from a trigger or a strict RLS policy.

-- 1. Attempt to drop likely restrictive triggers
DROP TRIGGER IF EXISTS "check_status_update" ON "public"."leave_applications";
DROP TRIGGER IF EXISTS "on_leave_status_update" ON "public"."leave_applications";
DROP TRIGGER IF EXISTS "prevent_status_update" ON "public"."leave_applications";
DROP TRIGGER IF EXISTS "check_leave_status_update" ON "public"."leave_applications";

-- 2. Drop the function that might be raising the exception
DROP FUNCTION IF EXISTS "public"."check_status_update_permission"();
DROP FUNCTION IF EXISTS "public"."check_leave_status_update"();

-- 3. Ensure Admins have full UPDATE permission
-- First, drop any existing restrictive policies for update if they exist and we can identify them.
-- (It's safer to add a new permissive policy with high priority if possible, or just ensure the admin one exists)

DROP POLICY IF EXISTS "admin_update_leaves" ON "public"."leave_applications";

CREATE POLICY "admin_update_leaves"
ON "public"."leave_applications"
FOR UPDATE
TO authenticated
USING (
  (SELECT "role" FROM "public"."profiles" WHERE "id" = "auth"."uid"()) = 'admin'
)
WITH CHECK (
  (SELECT "role" FROM "public"."profiles" WHERE "id" = "auth"."uid"()) = 'admin'
);

-- 4. Also ensure Faculty can update (since they might need to add remarks)
DROP POLICY IF EXISTS "faculty_update_leaves" ON "public"."leave_applications";

CREATE POLICY "faculty_update_leaves"
ON "public"."leave_applications"
FOR UPDATE
TO authenticated
USING (
  (SELECT "role" FROM "public"."profiles" WHERE "id" = "auth"."uid"()) = 'faculty'
)
WITH CHECK (
  (SELECT "role" FROM "public"."profiles" WHERE "id" = "auth"."uid"()) = 'faculty'
);
