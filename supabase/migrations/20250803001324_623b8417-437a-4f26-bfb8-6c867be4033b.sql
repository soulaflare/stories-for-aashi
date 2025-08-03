-- Ensure the watched_videos table exists with proper structure
CREATE TABLE IF NOT EXISTS public.watched_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.watched_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own watched videos" ON public.watched_videos;
DROP POLICY IF EXISTS "Users can insert their own watched videos" ON public.watched_videos;
DROP POLICY IF EXISTS "Users can update their own watched videos" ON public.watched_videos;

-- Create policies for user access
CREATE POLICY "Users can view their own watched videos" 
ON public.watched_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched videos" 
ON public.watched_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watched videos" 
ON public.watched_videos 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);