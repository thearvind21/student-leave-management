-- Restrict updates on contact_requests to admins only
-- Remove temporary anon update policy and rely on existing admin-only policy

DROP POLICY IF EXISTS "contact_requests_update_anon" ON public.contact_requests;

-- Ensure admin update policy exists (idempotent recreation)
DROP POLICY IF EXISTS "contact_requests_update_admin" ON public.contact_requests;
CREATE POLICY "contact_requests_update_admin"
  ON public.contact_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
