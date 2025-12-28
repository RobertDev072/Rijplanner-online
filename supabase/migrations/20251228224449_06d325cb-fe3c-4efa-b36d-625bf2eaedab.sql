-- Create a trigger function to deduct credits when a lesson is accepted
CREATE OR REPLACE FUNCTION public.deduct_credit_on_lesson_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only deduct when status changes to 'accepted' from something else
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    UPDATE public.lesson_credits
    SET 
      used_credits = used_credits + 1,
      updated_at = now()
    WHERE student_id = NEW.student_id
      AND tenant_id = NEW.tenant_id;
    
    -- Log the deduction
    RAISE NOTICE 'Deducted 1 credit for student % in tenant %', NEW.student_id, NEW.tenant_id;
  END IF;
  
  -- Refund credit if lesson is cancelled after being accepted
  IF NEW.status = 'cancelled' AND OLD.status = 'accepted' THEN
    UPDATE public.lesson_credits
    SET 
      used_credits = GREATEST(0, used_credits - 1),
      updated_at = now()
    WHERE student_id = NEW.student_id
      AND tenant_id = NEW.tenant_id;
    
    RAISE NOTICE 'Refunded 1 credit for student % in tenant %', NEW.student_id, NEW.tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on lessons table
DROP TRIGGER IF EXISTS trigger_deduct_credit_on_accept ON public.lessons;
CREATE TRIGGER trigger_deduct_credit_on_accept
  AFTER UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_credit_on_lesson_accept();