-- Secure RPC to reset a user's pincode with server-side permission checks

CREATE OR REPLACE FUNCTION public.reset_user_pincode(_target_user_id uuid, _new_pincode text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- basic validation
  IF _new_pincode IS NULL OR _new_pincode !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'Pincode must be exactly 4 digits';
  END IF;

  -- Allow self-update OR allowed hierarchy via existing helper
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _target_user_id <> auth.uid() AND NOT public.can_reset_pincode_for_user(_target_user_id) THEN
    RAISE EXCEPTION 'Not allowed to reset this user''s pincode';
  END IF;

  UPDATE public.users
  SET pincode = _new_pincode
  WHERE id = _target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;
END;
$$;

-- Allow logged-in users to call this RPC
GRANT EXECUTE ON FUNCTION public.reset_user_pincode(uuid, text) TO authenticated;