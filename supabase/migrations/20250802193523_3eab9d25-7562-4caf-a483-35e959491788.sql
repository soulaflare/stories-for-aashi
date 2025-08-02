-- Fix security warning: Add proper RLS policy for story_notifications table
-- Only system/admin functions should access this table
CREATE POLICY "Service role can manage story notifications" 
ON public.story_notifications 
FOR ALL 
USING (auth.role() = 'service_role');

-- Fix security warning: Update function to have immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;