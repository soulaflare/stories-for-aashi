-- Create table to track daily featured stories per user
CREATE TABLE public.featured_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.stories(id),
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, featured_date)
);

-- Enable Row Level Security
ALTER TABLE public.featured_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own featured stories" 
ON public.featured_stories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own featured stories" 
ON public.featured_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to get today's featured story for a user
CREATE OR REPLACE FUNCTION public.get_featured_story_for_user(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  story_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration TEXT,
  upload_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  views INTEGER,
  slug TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_featured_story_id UUID;
  new_featured_story_id UUID;
  story_record RECORD;
BEGIN
  -- Check if we already have a featured story for today
  SELECT fs.story_id INTO existing_featured_story_id
  FROM featured_stories fs
  WHERE fs.user_id = p_user_id 
    AND fs.featured_date = CURRENT_DATE;
  
  -- If we have one, return it
  IF existing_featured_story_id IS NOT NULL THEN
    RETURN QUERY
    SELECT s.id, s.title, s.description, s.thumbnail_url, s.video_url, 
           s.duration, s.upload_date, s.tags, s.views, s.slug
    FROM stories s
    WHERE s.id = existing_featured_story_id AND s.is_active = true;
    RETURN;
  END IF;
  
  -- Otherwise, determine a new featured story
  
  -- Rule 1: Check for new stories (uploaded in last 7 days)
  SELECT s.id INTO new_featured_story_id
  FROM stories s
  WHERE s.is_active = true 
    AND s.upload_date >= (CURRENT_DATE - INTERVAL '7 days')
  ORDER BY s.upload_date DESC
  LIMIT 1;
  
  -- Rule 2: If no new stories, get random unwatched story
  IF new_featured_story_id IS NULL AND p_user_id IS NOT NULL THEN
    SELECT s.id INTO new_featured_story_id
    FROM stories s
    WHERE s.is_active = true
      AND s.id NOT IN (
        SELECT wv.video_id::UUID 
        FROM watched_videos wv 
        WHERE wv.user_id = p_user_id
          AND s.video_id = wv.video_id
      )
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  -- Rule 3: If all stories are watched (or user not logged in), get any random story
  IF new_featured_story_id IS NULL THEN
    SELECT s.id INTO new_featured_story_id
    FROM stories s
    WHERE s.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  -- Store the featured story for today (only if user is logged in)
  IF new_featured_story_id IS NOT NULL AND p_user_id IS NOT NULL THEN
    INSERT INTO featured_stories (user_id, story_id, featured_date)
    VALUES (p_user_id, new_featured_story_id, CURRENT_DATE)
    ON CONFLICT (user_id, featured_date) DO NOTHING;
  END IF;
  
  -- Return the featured story
  RETURN QUERY
  SELECT s.id, s.title, s.description, s.thumbnail_url, s.video_url, 
         s.duration, s.upload_date, s.tags, s.views, s.slug
  FROM stories s
  WHERE s.id = new_featured_story_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_featured_story_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_featured_story_for_user(UUID) TO anon;