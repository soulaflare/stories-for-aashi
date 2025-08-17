-- Fix security issues with profiles table RLS policies

-- First, let's ensure the existing policies are properly secured
-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more restrictive and secure RLS policies for profiles table

-- 1. Users can only view their own profile data (including email)
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can only insert their own profile (must match authenticated user)
CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own profile data
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Explicitly deny DELETE operations to prevent accidental data loss
-- (Users should use account deletion through proper channels)
CREATE POLICY "Prevent profile deletion" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (false);

-- Fix story_requests table security for personal data protection
-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own story requests" ON public.story_requests;
DROP POLICY IF EXISTS "Users can insert story requests" ON public.story_requests;

-- 1. Users can only view their own story requests (protect personal info)
CREATE POLICY "Users view own requests only" 
ON public.story_requests 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Allow authenticated users to insert their own requests
CREATE POLICY "Authenticated users can create requests" 
ON public.story_requests 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow anonymous users to insert requests (but with null user_id)
CREATE POLICY "Anonymous users can create requests" 
ON public.story_requests 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- 4. Prevent updates to story requests to maintain data integrity
CREATE POLICY "Prevent request modifications" 
ON public.story_requests 
FOR UPDATE 
TO authenticated
USING (false);

-- 5. Prevent deletion of story requests to maintain audit trail
CREATE POLICY "Prevent request deletion" 
ON public.story_requests 
FOR DELETE 
TO authenticated
USING (false);

-- Add email validation for profiles to ensure data integrity
-- Create a function to validate email format
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Create a trigger to validate email format on insert/update
CREATE OR REPLACE FUNCTION public.validate_profile_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate email format if email is provided
  IF NEW.email IS NOT NULL AND NOT public.is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_email_trigger ON public.profiles;
CREATE TRIGGER validate_email_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_email();