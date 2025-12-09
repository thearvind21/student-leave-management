-- Update the trigger to ensure owner_id matches user_id
CREATE OR REPLACE FUNCTION public.set_leave_applications_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Ensure id is set
    IF NEW.id IS NULL THEN
        NEW.id := gen_random_uuid();
    END IF;

    -- Ensure owner_id matches user_id
    IF NEW.user_id IS NOT NULL THEN
        NEW.owner_id := NEW.user_id;
    END IF;

    RETURN NEW;
END;
$function$;