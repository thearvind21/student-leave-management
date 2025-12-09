-- Add decision fields to contact_requests for notes and timestamps
ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS decision_note text,
  ADD COLUMN IF NOT EXISTS decision_at timestamptz,
  ADD COLUMN IF NOT EXISTS decided_by uuid REFERENCES public.profiles(id);
