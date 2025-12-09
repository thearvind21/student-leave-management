-- Dynamic fix for "Direct status updates are not allowed" error
-- This script searches for the function containing the error message and drops it and its trigger.

DO $$
DECLARE
    r RECORD;
    t_name TEXT;
    f_name TEXT;
BEGIN
    -- 1. Find the function that contains the error message
    FOR r IN 
        SELECT p.proname, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosrc ILIKE '%Direct status updates are not allowed%'
    LOOP
        f_name := r.proname;
        RAISE NOTICE 'Found restrictive function: %', f_name;

        -- 2. Find and drop triggers that use this function
        FOR t_name IN 
            SELECT tgname 
            FROM pg_trigger 
            WHERE tgfoid = r.oid
        LOOP
            RAISE NOTICE 'Dropping trigger: %', t_name;
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.leave_applications', t_name);
        END LOOP;

        -- 3. Drop the function itself
        RAISE NOTICE 'Dropping function: %', f_name;
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I() CASCADE', f_name);
    END LOOP;
END $$;

-- 4. Re-apply the permissive policy just in case
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
