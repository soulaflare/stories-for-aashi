-- Add account deletion grace period fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN deletion_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN scheduled_for_deletion BOOLEAN DEFAULT FALSE,
ADD COLUMN deletion_token TEXT;

-- Create index for efficient querying of accounts scheduled for deletion
CREATE INDEX idx_profiles_scheduled_deletion ON public.profiles (scheduled_for_deletion, deletion_requested_at) 
WHERE scheduled_for_deletion = TRUE;

-- Create index for deletion token lookups
CREATE INDEX idx_profiles_deletion_token ON public.profiles (deletion_token) 
WHERE deletion_token IS NOT NULL;