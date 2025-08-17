-- Fix remaining security issues

-- 1. Fix the story_requests anonymous access issue
-- Remove the anonymous SELECT capability by ensuring only authenticated users 
-- and service roles can view story requests
DROP POLICY IF EXISTS "Anonymous users can create requests" ON public.story_requests;

-- Recreate policy to only allow INSERT for anonymous users (no SELECT)
CREATE POLICY "Anonymous users can create requests" 
ON public.story_requests 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- 2. Fix function search path issues for security
-- Update the email validation function to have a proper search path
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Update the profile validation function
CREATE OR REPLACE FUNCTION public.validate_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format if email is provided
  IF NEW.email IS NOT NULL AND NOT public.is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;