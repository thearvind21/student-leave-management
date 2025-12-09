-- Extend status enum (check constraint) to include accepted/rejected
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage ccu
    JOIN information_schema.table_constraints tc
      ON tc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'contact_requests'
      AND ccu.column_name = 'status'
      AND tc.constraint_type = 'CHECK'
  ) THEN
    -- If missing, add a check; but table created earlier by previous migration
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_status_check
      CHECK (status in ('new','in_progress','closed','accepted','rejected'));
  ELSE
    -- Drop existing constraint and recreate with new allowed values
    ALTER TABLE public.contact_requests
      DROP CONSTRAINT IF EXISTS contact_requests_status_check;
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_status_check
      CHECK (status in ('new','in_progress','closed','accepted','rejected'));
  END IF;
END $$;

-- Optionally allow anon updates (for demo/frontend-only admin)
DROP POLICY IF EXISTS "contact_requests_update_anon" ON public.contact_requests;
CREATE POLICY "contact_requests_update_anon"
  ON public.contact_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
