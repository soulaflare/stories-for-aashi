-- Create story_requests table
CREATE TABLE public.story_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_title TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.story_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for story_requests
CREATE POLICY "Users can insert story requests" 
ON public.story_requests 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE user_id IS NULL
  END
);

CREATE POLICY "Users can view their own story requests" 
ON public.story_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage story requests" 
ON public.story_requests 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_story_requests_updated_at
BEFORE UPDATE ON public.story_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();