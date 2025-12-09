-- Re-enable anon updates for contact_requests (demo-only)
-- This allows your frontend admin UI to update status without a Supabase-authenticated session.
-- Tighten this for production by removing this policy and using an authenticated admin session.

DROP POLICY IF EXISTS "contact_requests_update_anon" ON public.contact_requests;
CREATE POLICY "contact_requests_update_anon"
  ON public.contact_requests FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
