
-- 1. Add leave_quota to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS leave_quota INT DEFAULT 10; -- for example, 10 days/year

-- 2. Add remarks to leave_applications
ALTER TABLE public.leave_applications
ADD COLUMN IF NOT EXISTS teacher_remarks TEXT;

-- 3. (Optional for extensibility) Convert role column to use ENUM if not already done,
-- But your schema already uses ENUM 'user_role'

-- 4. (NLP / spam detection support) Add a boolean flag for repetitive/invalid reason
ALTER TABLE public.leave_applications
ADD COLUMN IF NOT EXISTS is_reason_invalid BOOLEAN DEFAULT false;

-- 5. (2FA) Add a column to profiles to store 2FA OTP secret (optional for mobile/email based, can be filled as needed)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS otp_secret TEXT;

-- 6. (If you want separate tables for leave quota history)
CREATE TABLE IF NOT EXISTS public.leave_quota_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  old_quota INT,
  new_quota INT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 7. (i18n support) No SQL needed unless you want labels in database

