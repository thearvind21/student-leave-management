-- Add avatar_url to admin_users for profile picture support
ALTER TABLE IF EXISTS public.admin_users
ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE IF EXISTS public.admin_users
ADD COLUMN IF NOT EXISTS updated_at timestamptz;
